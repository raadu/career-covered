import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// An empty string means "clear this link" (write null) — distinct from the
// field being omitted entirely, which means "leave it untouched".
const emptyStringToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

/**
 * Quick Links are free text by design: users paste them into job application
 * forms in whatever shape each form wants, so there is no URL/email/phone
 * format check. Only a type and length bound remain, to reject non-text
 * payloads and cap storage. Values are never rendered as links or HTML —
 * only shown as text and copied — so arbitrary text is safe to accept.
 */
function QuickLinkField(name: string, maxLength: number, example: string) {
  return applyDecorators(
    ApiPropertyOptional({ example, maxLength }),
    IsOptional(),
    Transform(emptyStringToNull),
    // null = "clear this field": skip the checks below for it.
    ValidateIf((_dto: unknown, value: unknown) => value !== null),
    IsString({ message: `${name} must be text` }),
    MaxLength(maxLength, {
      message: `${name} must be at most ${maxLength} characters`,
    }),
  );
}

export class UpdateProfileLinksDto {
  @QuickLinkField('linkedinUrl', 2048, 'https://linkedin.com/in/username')
  linkedinUrl?: string | null;

  @QuickLinkField('githubUrl', 2048, 'https://github.com/username')
  githubUrl?: string | null;

  @QuickLinkField('websiteUrl', 2048, 'https://mysite.dev')
  websiteUrl?: string | null;

  @QuickLinkField('contactEmail', 320, 'contact@example.com')
  contactEmail?: string | null;

  @QuickLinkField('phoneNumber', 64, '+1 (415) 555-0100 ext. 12')
  phoneNumber?: string | null;

  @QuickLinkField('extraLink1Url', 2048, 'https://portfolio.example.com')
  extraLink1Url?: string | null;

  @QuickLinkField('extraLink2Url', 2048, 'https://blog.example.com')
  extraLink2Url?: string | null;
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
  phoneNumber: string | null;
  extraLink1Url: string | null;
  extraLink2Url: string | null;
}
