
import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

// Validate environment variables
const envSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  PORT: z.string().transform(val => parseInt(val, 10)),
});

// This will throw an error if validation fails
const env = envSchema.parse(process.env);

export const config = {
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d'
  },
  server: {
    port: env.PORT
  }
};