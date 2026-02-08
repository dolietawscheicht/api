import { prisma } from "@/framework/prisma";
import type { AtLeastOne } from "@/utils/types";
import { injectable } from "tsyringe";

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	avatar: string | null;
	bio: string | null;
	confirmed: boolean;
	role: "regular" | "sudo";
}

@injectable()
export class Users {
	async create(data: Pick<User, "email" | "password" | "name">): Promise<User> {
		return await prisma.user.create({ data });
	}

	async findWhere(
		where: AtLeastOne<Pick<User, "id" | "email" | "name">>,
	): Promise<User | null> {
		return await prisma.user.findUnique({ where });
	}

	async update(
		where: AtLeastOne<Pick<User, "id" | "email" | "name">>,
		data: AtLeastOne<Omit<User, "id">>,
	): Promise<User> {
		return await prisma.user.update({ where, data });
	}
}
