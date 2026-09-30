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
      phoneNumber: user.phoneNumber,
      extraLink1Url: user.extraLink1Url,
      extraLink2Url: user.extraLink2Url,
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
        ...(dto.phoneNumber !== undefined && {
          phoneNumber: dto.phoneNumber,
        }),
        ...(dto.extraLink1Url !== undefined && {
          extraLink1Url: dto.extraLink1Url,
        }),
        ...(dto.extraLink2Url !== undefined && {
          extraLink2Url: dto.extraLink2Url,
        }),
      },
    });
    return this.toResponse(updated);
  }
}
