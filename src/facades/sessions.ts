import { Cache } from "@/facades/cache";
import { Config } from "@/facades/config";
import { Exception } from "@/general/exception";
import type { User } from "@/repos/users";
import { Strings } from "@/utils/strings";
import { inject, injectable } from "tsyringe";

interface Session {
	id: string;
	userAgent: string | null;
	logginedAt: string;
	userId: User["email"];
}

@injectable()
export class Sessions {
	constructor(
		@inject(Cache) private cache: Cache,
		@inject(Config) private config: Config,
		@inject(Strings) private strings: Strings,
	) {}

	async initialize(
		payload: Omit<Session, "id" | "logginedAt">,
	): Promise<string> {
		const sessionId = await this.strings.random(16);

		this.cache.set(
			`session:${sessionId}`,
			{
				id: sessionId,
				logginedAt: new Date().toISOString(),
				...payload,
			} satisfies Session,
			this.config.require("SESSION_TTL_SEC"),
		);
		this.cache.pushMember(`user:${payload.userId}:sessions`, sessionId);

		return sessionId;
	}

	async get(sessionId: string): Promise<Session> {
		const session = await this.cache.get<Session>(`session:${sessionId}`);

		if (session) {
			return session;
		}

		throw new Exception("Сесия не найдена", "Unauthorized");
	}

	async getAll(userId: User["id"]): Promise<Session[]> {
		const sessionIds = await this.cache.getMembers(`user:${userId}:sessions`);
		const sessions = [];

		for (let i = 0; i < sessionIds.length; i++) {
			const session = await this.cache.get<Session>(`session:${sessionIds[i]}`);

			if (session) {
				sessions.push(session);
			}
		}

		return sessions;
	}

	async destroy(sessionId: string): Promise<void> {
		this.cache.delete(`session:${sessionId}`);
	}

	async destroyAll(userId: User["id"]): Promise<void> {
		const sessionIds = await this.cache.getMembers(`user:${userId}:sessions`);

		for (let i = 0; i < sessionIds.length; i++) {
			await this.cache.delete(`session:${sessionIds[i]}`);
			await this.cache.deleteMember(`user:${userId}:sessions`, sessionIds[i]);
		}
	}
}
