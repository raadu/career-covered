import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileLinksDto } from './profile.dto';

type Field = keyof UpdateProfileLinksDto;

// Every Quick Links field and its length cap. There is no format check on
// any of them — only "must be text" and the cap.
const FIELDS: [Field, number][] = [
  ['linkedinUrl', 2048],
  ['githubUrl', 2048],
  ['websiteUrl', 2048],
  ['contactEmail', 320],
  ['phoneNumber', 64],
  ['extraLink1Url', 2048],
  ['extraLink2Url', 2048],
];

const build = (body: Record<string, unknown>) =>
  plainToInstance(UpdateProfileLinksDto, body);
const errorsFor = async (field: Field, value: unknown) =>
  (await validate(build({ [field]: value }))).filter(
    (e) => e.property === field,
  );

describe('UpdateProfileLinksDto', () => {
  it('is valid when every field is omitted', async () => {
    expect(await validate(build({}))).toHaveLength(0);
  });

  describe.each(FIELDS)('%s (max %i)', (field, max) => {
    it.each([
      'https://example.com/profile',
      'not-a-url',
      'me at example dot com',
      '+1 (415) 555-0100 ext. 12',
      'anything at all ✨',
    ])('accepts free text: %j', async (value) => {
      expect(await errorsFor(field, value)).toHaveLength(0);
    });

    it(`accepts exactly ${max} characters`, async () => {
      expect(await errorsFor(field, 'a'.repeat(max))).toHaveLength(0);
    });

    it(`rejects ${max + 1} characters with a clear message`, async () => {
      const [error] = await errorsFor(field, 'a'.repeat(max + 1));
      expect(error?.constraints?.maxLength).toBe(
        `${field} must be at most ${max} characters`,
      );
    });

    it('rejects a non-text value', async () => {
      const [error] = await errorsFor(field, 12345);
      expect(error?.constraints?.isString).toBe(`${field} must be text`);
    });

    it('clears with an empty string (becomes null, no error)', async () => {
      const dto = build({ [field]: '' });
      expect(await validate(dto)).toHaveLength(0);
      expect(dto[field]).toBeNull();
    });

    it('stays undefined when omitted (distinct from cleared)', () => {
      expect(build({})[field]).toBeUndefined();
    });
  });

  it('validates each field independently of the others', async () => {
    const errors = await validate(
      build({ linkedinUrl: 'fine', phoneNumber: 'x'.repeat(65) }),
    );
    expect(errors.map((e) => e.property)).toEqual(['phoneNumber']);
  });
});
