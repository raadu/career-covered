// @ts-check
import tseslint from 'typescript-eslint';
import nestConfig from '@career-covered/eslint-config/nest.js';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist'],
  },
  ...nestConfig,
);

