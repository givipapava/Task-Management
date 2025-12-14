import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Ensures all required environment variables are present and valid
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
});
