import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GenerateDto } from './generate.dto';
import { ALLOWED_MODEL_IDS } from '../allowed-models';

describe('GenerateDto', () => {
  const baseDto = {
    messages: [{ role: 'user', content: 'write a cover letter' }],
  };

  it.each(ALLOWED_MODEL_IDS)('accepts allowed model %s', async (model) => {
    const dto = plainToInstance(GenerateDto, { ...baseDto, model });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a deprecated/unlisted model', async () => {
    const dto = plainToInstance(GenerateDto, {
      ...baseDto,
      model: 'llama-3.3-70b-versatile',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'model')).toBe(true);
  });

  it.each(['low', 'medium', 'high'])(
    'accepts reasoning_effort %s',
    async (reasoning_effort) => {
      const dto = plainToInstance(GenerateDto, {
        ...baseDto,
        model: ALLOWED_MODEL_IDS[0],
        reasoning_effort,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    },
  );

  it('is valid without reasoning_effort (optional)', async () => {
    const dto = plainToInstance(GenerateDto, {
      ...baseDto,
      model: ALLOWED_MODEL_IDS[0],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an unsupported reasoning_effort value', async () => {
    const dto = plainToInstance(GenerateDto, {
      ...baseDto,
      model: ALLOWED_MODEL_IDS[0],
      reasoning_effort: 'extreme',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reasoning_effort')).toBe(true);
  });
});
