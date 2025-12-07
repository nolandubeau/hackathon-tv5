import baseConfig from '@workspace/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '!**/.next',
    '!**/.cache',
    '!**/.turbo',
    '!**/node_modules',
    '!**/build',
    '!**/dist'
  ],
};

export default config;
