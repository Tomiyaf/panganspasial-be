import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:3000"),
  UPLOAD_DIR: z.string().default("public/uploads"),
  MAX_FILE_SIZE_MB: z.string().default("5").transform((val) => parseInt(val, 10)),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment configuration. Please check your .env file.");
}

export const env = _env.data;
export default env;
