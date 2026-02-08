import "@dotenvx/dotenvx/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "./src/framework/prisma/schema.prisma",
	migrations: {
		path: "./src/framework/prisma/migrations",
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
