import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileLinksDto } from './profile.dto';

describe('UpdateProfileLinksDto', () => {
  it('is valid when every field is omitted', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid URL for linkedinUrl/githubUrl/websiteUrl', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      linkedinUrl: 'https://linkedin.com/in/username',
      githubUrl: 'https://github.com/username',
      websiteUrl: 'https://mysite.dev',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid email for contactEmail', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      contactEmail: 'contact@example.com',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid URL', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      linkedinUrl: 'not-a-url',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'linkedinUrl')).toBe(true);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      contactEmail: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'contactEmail')).toBe(true);
  });

  it('transforms an empty string to null and skips URL/email validation for it', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      linkedinUrl: '',
      contactEmail: '',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.linkedinUrl).toBeNull();
    expect(dto.contactEmail).toBeNull();
  });

  it('leaves an omitted field as undefined after transform (distinct from cleared)', async () => {
    const dto = plainToInstance(UpdateProfileLinksDto, {
      linkedinUrl: 'https://linkedin.com/in/x',
    });
    expect(dto.githubUrl).toBeUndefined();
  });

  it('rejects a URL over the 2048-character limit', async () => {
    const longUrl = `https://example.com/${'a'.repeat(2048)}`;
    const dto = plainToInstance(UpdateProfileLinksDto, {
      websiteUrl: longUrl,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'websiteUrl')).toBe(true);
  });
});
