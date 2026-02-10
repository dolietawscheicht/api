import { Config } from "@/adapters/config";
import { Time, type Duration } from "@/utils/time";
import { inject, singleton } from "tsyringe";

@singleton()
export class Cache {
	private cache;

	constructor(
		@inject(Config) config: Config,
		@inject(Time) private time: Time,
	) {
		this.cache = new Bun.RedisClient(config.require("CACHE_URL"));
	}

	async set(key: string, value: string, duration: Duration): Promise<void> {
		await this.cache.setex(key, this.time.toSec(duration), value);
	}

	async get(key: string): Promise<string | null> {
		return await this.cache.get(key);
	}

	async consume(key: string): Promise<string | null> {
		return await this.cache.getdel(key);
	}

	async delete(...keys: string[]): Promise<void> {
		await this.cache.del(...keys);
	}

	async setHash(
		key: string,
		value: Record<string, string>,
		duration: Duration,
	): Promise<void> {
		await this.cache.hset(key, value);
		await this.cache.expire(key, this.time.toSec(duration));
	}

	async getHash<Value extends Record<any, any>>(
		key: string,
	): Promise<Value | null> {
		const value = await this.cache.hgetall(key);
		return Object.keys(value).length ? (value as Value) : null;
	}

	async addToSet(key: string, ...values: string[]): Promise<void> {
		await this.cache.sadd(key, ...values);
	}

	async deleteFromSet(key: string, ...values: string[]): Promise<void> {
		await this.cache.srem(key, ...values);
	}

	async getSet(key: string): Promise<string[]> {
		return await this.cache.smembers(key);
	}
}
