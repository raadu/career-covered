import { describe, it, expect } from 'vitest';
import { EMOJI_SERIOUS, EMOJI_CRY } from '../emojiUtils';

describe('emojiUtils', () => {
  it('EMOJI_SERIOUS is 😠', () => {
    expect(EMOJI_SERIOUS).toBe('\uD83D\uDE20');
  });

  it('EMOJI_CRY is 😢', () => {
    expect(EMOJI_CRY).toBe('\uD83D\uDE22');
  });
});
