import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const env     = process.env.ENV || 'dev';
const baseURL = process.env[`BASE_URL_${env}`];

export default defineConfig({
  testDir:   './tests',
  fullyParallel: true,
  retries:   process.env.CI ? 1 : 0,
  reporter:  'html',

  use: {
    baseURL,
    extraHTTPHeaders: { Accept: 'application/json' }
  }
});
