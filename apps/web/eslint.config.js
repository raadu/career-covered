import reactConfig from '@career-covered/eslint-config/react.js';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  ...reactConfig,
]);

