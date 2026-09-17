import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileLinksDto, ProfileResponseDto } from './dto/profile.dto';
import * as db from '@career-covered/db';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: db.User): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      websiteUrl: user.websiteUrl,
      contactEmail: user.contactEmail,
    };
  }

  async updateLinks(
    userId: string,
    dto: UpdateProfileLinksDto,
  ): Promise<ProfileResponseDto> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.contactEmail !== undefined && {
          contactEmail: dto.contactEmail,
        }),
      },
    });
    return this.toResponse(updated);
  }
}
