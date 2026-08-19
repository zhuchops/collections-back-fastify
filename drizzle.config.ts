import { loadEnvFile } from "process";
import { defineConfig } from "drizzle-kit";

loadEnvFile();
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizlle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
