import { Config } from "@/adapters/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { container } from "tsyringe";
import { PrismaClient } from "./generated/client";

const config = container.resolve(Config);

export const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: config.require("DATABASE_URL"),
	}),
});
