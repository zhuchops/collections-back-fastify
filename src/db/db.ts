import { loadEnvFile } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import pg from 'pg';

try {
  loadEnvFile();
} catch {
  // Ignore if .env doesn't exist
}

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is missing. Please set DB_URL in .env file.');
}

const pool = new pg.Pool({ connectionString: process.env.DB_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
