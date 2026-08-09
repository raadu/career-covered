import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PDFDocument } from 'pdf-lib';
import { extractText } from 'unpdf';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, type StoredObject } from '../storage/storage.service';
import type { ResumeResponseDto } from './dto/resume.dto';
import { MAX_RESUME_BYTES, MAX_RESUMES_PER_USER } from './resume.constants';
import * as db from '@career-covered/db';

const PDF_MAGIC_BYTES = Buffer.from('%PDF-');

export interface ResumeFileStream extends StoredObject {
  resume: db.Resume;
}

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private toResponse(resume: db.Resume): ResumeResponseDto {
    return {
      id: resume.id,
      name: resume.name,
      originalFileName: resume.originalFileName,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
      order: resume.order,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    };
  }

  private assertIsPdf(buffer: Buffer): void {
    if (
      buffer.length < PDF_MAGIC_BYTES.length ||
      buffer.subarray(0, PDF_MAGIC_BYTES.length).compare(PDF_MAGIC_BYTES) !== 0
    ) {
      // file.mimetype is entirely client-controlled — a renamed .exe sent
      // with Content-Type: application/pdf would otherwise pass, so the
      // actual file bytes are checked instead of trusting the header.
      throw new BadRequestException('File is not a valid PDF');
    }
  }

  /**
   * Best-effort, lossless compression via pdf-lib's object-stream
   * deduplication. Does not recompress embedded images — that would need
   * heavier tooling (e.g. Ghostscript) for a use case (small, mostly-text
   * resume PDFs) where the benefit is marginal. Falls back to the original
   * bytes if pdf-lib can't parse the file, rather than failing the upload
   * over a best-effort optimization pass.
   */
  private async compress(buffer: Buffer): Promise<Buffer> {
    try {
      const doc = await PDFDocument.load(buffer);
      const bytes = await doc.save({ useObjectStreams: true });
      return Buffer.from(bytes);
    } catch (err) {
      this.logger.warn(
        `PDF compression failed, storing original bytes: ${(err as Error).message}`,
      );
      return buffer;
    }
  }

  /**
   * Never throws — extraction is for a future feature nothing depends on
   * yet, so a corrupt/encrypted/scanned-image-only PDF should still upload
   * successfully with parsedText left null, not block the whole feature.
   */
  private async extractResumeText(buffer: Buffer): Promise<string | null> {
    try {
      const { text } = await extractText(new Uint8Array(buffer), {
        mergePages: true,
      });
      return text.trim() || null;
    } catch (err) {
      this.logger.warn(`PDF text extraction failed: ${(err as Error).message}`);
      return null;
    }
  }

  async findAll(userId: string): Promise<ResumeResponseDto[]> {
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
    return resumes.map((r) => this.toResponse(r));
  }

  async create(
    userId: string,
    file: Express.Multer.File,
    name: string | undefined,
  ): Promise<ResumeResponseDto> {
    this.assertIsPdf(file.buffer);

    // Fast, non-authoritative fail for the common case (a user knowingly at
    // the cap) — avoids a wasted compress/extract/upload before finding out.
    // The real, race-safe check happens again in the transaction below.
    const earlyCount = await this.prisma.resume.count({ where: { userId } });
    if (earlyCount >= MAX_RESUMES_PER_USER) {
      throw new ConflictException(
        `You can only have up to ${MAX_RESUMES_PER_USER} resumes`,
      );
    }

    const compressed = await this.compress(file.buffer);
    if (compressed.length > MAX_RESUME_BYTES) {
      throw new BadRequestException('File exceeds the 10MB size limit');
    }

    const parsedText = await this.extractResumeText(compressed);
    const storageKey = `resumes/${userId}/${randomUUID()}.pdf`;
    const displayName =
      name?.trim() || file.originalname.replace(/\.pdf$/i, '');

    await this.storage.putObject(storageKey, compressed, 'application/pdf');

    try {
      const resume = await this.prisma.$transaction(async (tx) => {
        // Without this lock, two concurrent uploads from the same user
        // could each read count=7 before either commits, and both would
        // pass the `< 8` check — serializing the count-then-create per
        // user closes that race without needing a DB-level row lock on a
        // table that doesn't exist yet.
        // $executeRaw, not $queryRaw: pg_advisory_xact_lock() returns void,
        // which Prisma's $queryRaw cannot deserialize into a result column.
        // $executeRaw only reports an affected-row count, sidestepping that
        // entirely — the return value isn't needed anyway, only the lock's
        // side effect for the remainder of this transaction.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        const existing = await tx.resume.findMany({
          where: { userId },
          select: { order: true },
        });
        if (existing.length >= MAX_RESUMES_PER_USER) {
          throw new ConflictException(
            `You can only have up to ${MAX_RESUMES_PER_USER} resumes`,
          );
        }
        const nextOrder =
          existing.length === 0
            ? 0
            : Math.max(...existing.map((r) => r.order)) + 1;

        return tx.resume.create({
          data: {
            userId,
            name: displayName,
            originalFileName: file.originalname,
            storageKey,
            mimeType: 'application/pdf',
            fileSize: compressed.length,
            parsedText,
            order: nextOrder,
          },
        });
      });

      return this.toResponse(resume);
    } catch (err) {
      // The DB write lost the race against the cap (or failed outright) —
      // the object we already uploaded is now orphaned. Harmless (never
      // surfaced to any user) and cheaper to leave than to add cleanup
      // infrastructure for what should be a rare edge case.
      await this.storage
        .deleteObject(storageKey)
        .catch(() => undefined /* best-effort only */);
      throw err;
    }
  }

  async replace(
    id: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<ResumeResponseDto> {
    const existing = await this.prisma.resume.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    this.assertIsPdf(file.buffer);
    const compressed = await this.compress(file.buffer);
    if (compressed.length > MAX_RESUME_BYTES) {
      throw new BadRequestException('File exceeds the 10MB size limit');
    }
    const parsedText = await this.extractResumeText(compressed);
    const storageKey = `resumes/${userId}/${randomUUID()}.pdf`;

    await this.storage.putObject(storageKey, compressed, 'application/pdf');

    // name/order are deliberately left untouched.
    const updated = await this.prisma.resume.update({
      where: { id },
      data: {
        originalFileName: file.originalname,
        storageKey,
        mimeType: 'application/pdf',
        fileSize: compressed.length,
        parsedText,
      },
    });

    await this.storage
      .deleteObject(existing.storageKey)
      .catch((err) =>
        this.logger.warn(
          `Failed to delete replaced object "${existing.storageKey}": ${(err as Error).message}`,
        ),
      );

    return this.toResponse(updated);
  }

  async rename(
    id: string,
    userId: string,
    name: string,
  ): Promise<ResumeResponseDto> {
    const { count } = await this.prisma.resume.updateMany({
      where: { id, userId },
      data: { name },
    });
    if (count === 0) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });
    return this.toResponse(resume!);
  }

  async remove(id: string, userId: string): Promise<void> {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    await this.prisma.resume.delete({ where: { id } });
    await this.storage
      .deleteObject(resume.storageKey)
      .catch((err) =>
        this.logger.warn(
          `Failed to delete object "${resume.storageKey}" for removed resume ${id}: ${(err as Error).message}`,
        ),
      );
  }

  async reorder(userId: string, ids: string[]): Promise<ResumeResponseDto[]> {
    const current = await this.prisma.resume.findMany({
      where: { userId },
      select: { id: true },
    });
    const currentIds = new Set(current.map((r) => r.id));
    const submittedIds = new Set(ids);
    const isPermutation =
      ids.length === current.length &&
      submittedIds.size === ids.length &&
      [...submittedIds].every((id) => currentIds.has(id));

    if (!isPermutation) {
      throw new BadRequestException(
        'ids must be exactly the set of your current resume ids',
      );
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.resume.updateMany({
          where: { id, userId },
          data: { order: index },
        }),
      ),
    );

    return this.findAll(userId);
  }

  /**
   * Used by the /preview and /download streaming routes. Self-heals a
   * Resume row whose storageKey no longer resolves in the bucket (manual
   * bucket tampering, an R2/MinIO incident) by deleting the now-unusable
   * row and surfacing a clear error, rather than leaving a permanently
   * broken card in the grid.
   */
  async getFileStream(id: string, userId: string): Promise<ResumeFileStream> {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    try {
      const object = await this.storage.getObject(resume.storageKey);
      return { ...object, resume };
    } catch (err) {
      if (err instanceof NotFoundException) {
        await this.prisma.resume
          .delete({ where: { id } })
          .catch(() => undefined);
        throw new NotFoundException(
          "This resume's file is missing and needs to be re-uploaded",
        );
      }
      throw err;
    }
  }
}
