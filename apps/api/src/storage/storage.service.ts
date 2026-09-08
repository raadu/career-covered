import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

export interface StoredObject {
  stream: Readable;
  contentLength?: number;
  contentType?: string;
}

// Thin, resume-agnostic wrapper around an S3-compatible object store. The
// same client code talks to MinIO locally and Cloudflare R2 in production —
// only the endpoint/credentials (S3_* env vars) differ between them.
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.client = new S3Client({
      endpoint: this.config.getOrThrow<string>('S3_ENDPOINT'),
      region: this.config.get<string>('S3_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_KEY'),
      },
      // Required for MinIO's path-style URLs; a harmless no-op for R2.
      forcePathStyle: true,
    });
  }

  async onModuleInit(): Promise<void> {
    // Auto-create the bucket only outside production — in prod the bucket
    // is provisioned once, manually, in the Cloudflare R2 dashboard, and
    // the API's production credentials deliberately don't get CreateBucket
    // permission (least privilege), so don't even attempt it there.
    if (this.config.get<string>('NODE_ENV') === 'production') return;

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
        this.logger.log(`Created storage bucket "${this.bucket}"`);
      } catch (err) {
        const name = (err as { name?: string }).name;
        if (
          name === 'BucketAlreadyOwnedByYou' ||
          name === 'BucketAlreadyExists'
        ) {
          return;
        }
        this.logger.error(
          `Failed to create storage bucket "${this.bucket}"`,
          err as Error,
        );
      }
    }
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to upload object "${key}"`, err as Error);
      throw new InternalServerErrorException(
        'Failed to store the uploaded file',
      );
    }
  }

  async getObject(key: string): Promise<StoredObject> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        stream: result.Body as Readable,
        contentLength: result.ContentLength,
        contentType: result.ContentType,
      };
    } catch (err) {
      if ((err as { name?: string }).name === 'NoSuchKey') {
        throw new NotFoundException('File not found in storage');
      }
      this.logger.error(`Failed to fetch object "${key}"`, err as Error);
      throw new InternalServerErrorException('Failed to retrieve the file');
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.error(`Failed to delete object "${key}"`, err as Error);
      throw new InternalServerErrorException('Failed to delete the file');
    }
  }
}
