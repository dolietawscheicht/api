import { Cache } from "@/adapters/cache";
import { Config } from "@/adapters/config";
import { Exception } from "@/general/exception";
import type { User } from "@/repos/users";
import { Strings } from "@/utils/strings";
import { inject, injectable } from "tsyringe";

interface Session {
	userId: User["email"];
	sessionId: string;
	agent: string;
	logginedAt: string;
}

@injectable()
export class Sessions {
	constructor(
		@inject(Cache) private cache: Cache,
		@inject(Config) private config: Config,
		@inject(Strings) private strings: Strings,
	) {}

	async initialize(
		payload: Omit<Session, "sessionId" | "logginedAt">,
	): Promise<string> {
		const sessionId = await this.strings.random(16);

		await this.cache.setHash(
			`session:${sessionId}`,
			{
				sessionId,
				logginedAt: new Date().toISOString(),
				...payload,
			} satisfies Session,
			this.config.require("SESSION_LIFETIME"),
		);
		await this.cache.addToSet(`user:${payload.userId}:session_ids`, sessionId);

		return sessionId;
	}

	async find(sessionId: string): Promise<Session | null> {
		return await this.cache.getHash<Session>(`session:${sessionId}`);
	}

	async findAll(userId: User["id"]): Promise<Session[]> {
		const sessionIds = await this.cache.getSet(`user:${userId}:session_ids`);
		const sessions: Session[] = [];

		for await (const id of sessionIds) {
			const session = await this.cache.getHash<Session>(`session:${id}`);

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
		const sessionIds = await this.cache.getSet(`user:${userId}:session_ids`);

		await this.cache.deleteFromSet(`user:${userId}:session_ids`, ...sessionIds);
		await this.cache.delete(...sessionIds.map((id) => `session:${id}`));
	}
}
