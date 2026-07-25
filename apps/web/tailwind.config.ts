import type { Config } from 'tailwindcss';

const base = require('@tasork/config/tailwind/base.js');

const config: Config = {
  ...base,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
