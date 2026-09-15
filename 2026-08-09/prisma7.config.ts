// prisma7.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Ruta del esquema principal
  schema: "prisma/schema.prisma",

  // Carpeta de almacenamiento de migraciones DDL
  migrations: {
    path: "prisma/migrations",
  },

  // Fuente de datos y cadena de conexion
  datasource: {
    url: env("DATABASE_URL")
  }
});