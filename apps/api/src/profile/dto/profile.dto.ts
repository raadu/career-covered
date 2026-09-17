import {
  IsEmail,
  IsUrl,
  IsOptional,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// An empty string means "clear this link" (write null) — distinct from the
// field being omitted entirely, which means "leave it untouched". Without
// this transform, @IsUrl()/@IsEmail() would reject '' outright, and there'd
// be no way to remove a previously-saved link from the client.
const emptyStringToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

export class UpdateProfileLinksDto {
  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsOptional()
  @Transform(emptyStringToNull)
  @ValidateIf((o: UpdateProfileLinksDto) => o.linkedinUrl !== null)
  @IsUrl({}, { message: 'linkedinUrl must be a valid URL' })
  @MaxLength(2048)
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://github.com/username' })
  @IsOptional()
  @Transform(emptyStringToNull)
  @ValidateIf((o: UpdateProfileLinksDto) => o.githubUrl !== null)
  @IsUrl({}, { message: 'githubUrl must be a valid URL' })
  @MaxLength(2048)
  githubUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://mysite.dev' })
  @IsOptional()
  @Transform(emptyStringToNull)
  @ValidateIf((o: UpdateProfileLinksDto) => o.websiteUrl !== null)
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  @MaxLength(2048)
  websiteUrl?: string | null;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsOptional()
  @Transform(emptyStringToNull)
  @ValidateIf((o: UpdateProfileLinksDto) => o.contactEmail !== null)
  @IsEmail({}, { message: 'contactEmail must be a valid email' })
  @MaxLength(320)
  contactEmail?: string | null;
}

export interface ProfileResponseDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
}
