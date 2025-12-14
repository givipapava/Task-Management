import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_API_TIMEOUT: z.coerce.number().min(1000).max(60000).optional(),
  MODE: z.enum(['development', 'production', 'test']),
});

const envVars = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
  MODE: import.meta.env.MODE || 'development',
};

export const env = envSchema.parse(envVars);
