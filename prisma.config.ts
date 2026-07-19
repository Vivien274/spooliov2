import dotenv from "dotenv";
import path from "path";

// Load .env.local like Next.js does
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "mysql://localhost:3306/placeholder_db",
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
});
