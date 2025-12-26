import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql', // Changed from sqlite to postgresql for production
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/sellercloudx',
  },
  verbose: true,
  strict: true,
});
