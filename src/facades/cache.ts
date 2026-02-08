import { Config } from "@/facades/config";
import type { Serializable } from "@/utils/types";
import { inject, singleton } from "tsyringe";

@singleton()
export class Cache {
	private cache;

	constructor(@inject(Config) config: Config) {
		this.cache = new Bun.RedisClient(config.require("CACHE_URL"));
	}

	async set(key: string, value: Serializable, ttl: number): Promise<void> {
		this.cache.setex(key, ttl, JSON.stringify(value));
	}

	async get<Value extends Serializable>(key: string): Promise<Value | null> {
		const value = await this.cache.get(key);
		return value ? JSON.parse(value) : null;
	}

	async deduct<Value extends Serializable>(key: string): Promise<Value | null> {
		const value = await this.cache.getdel(key);
		return value ? JSON.parse(value) : null;
	}

	async delete(key: string): Promise<void> {
		this.cache.del(key);
	}

	async pushMember(key: string, value: Serializable): Promise<void> {
		this.cache.sadd(key, JSON.stringify(value));
	}

	async deleteMember(key: string, member: Serializable): Promise<void> {
		await this.cache.srem(key, member);
	}

	async getMembers<Value extends Serializable>(key: string): Promise<Value[]> {
		const members = await this.cache.smembers(key);
		return members.map((member) => JSON.parse(member));
	}
}
