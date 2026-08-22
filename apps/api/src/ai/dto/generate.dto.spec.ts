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
});
