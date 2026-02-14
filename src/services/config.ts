import { Time } from "@/utils/time";
import { inject, singleton } from "tsyringe";
import * as v from "valibot";

@singleton()
export class Config {
	private config;

	constructor(@inject(Time) private Time: Time) {
		this.config = v.parse(
			v.object({
				NODE_ENV: v.picklist(["production", "development"]),
				APP_PORT: v.pipe(v.string(), v.toNumber()),
				APP_NAME: v.string(),
				DATABASE_CONNECTION: v.string(),
				DATABASE_USER: v.string(),
				DATABASE_PASSWORD: v.string(),
				DATABASE_HOST: v.string(),
				DATABASE_PORT: v.pipe(v.string(), v.toNumber()),
				DATABASE_NAME: v.string(),
				DATABASE_URL: v.string(),
				CACHE_CONNECTION: v.string(),
				CACHE_PASSWORD: v.string(),
				CACHE_HOST: v.string(),
				CACHE_PORT: v.pipe(v.string(), v.toNumber()),
				CACHE_URL: v.string(),
				MAIL_CONNECTION: v.string(),
				MAIL_USER: v.string(),
				MAIL_PASSWORD: v.string(),
				MAIL_HOST: v.string(),
				MAIL_PORT: v.pipe(v.string(), v.toNumber()),
				MAIL_FROM: v.string(),
				MAIL_URL: v.string(),
				S3_CONNECTION: v.string(),
				S3_ACCESS_KEY_ID: v.string(),
				S3_SECRET_ACCESS_KEY: v.string(),
				S3_SESSION_TOKEN: v.string(),
				S3_HOST: v.string(),
				S3_PORT: v.pipe(v.string(), v.toNumber()),
				S3_ENDPOINT: v.string(),
				S3_BUCKET: v.string(),
				S3_REGION: v.string(),
				AUTH_LIFETIME: this.Time.durationSchema,
				SESSION_SECRET: v.string(),
				SESSION_LIFETIME: this.Time.durationSchema,
			}),
			Bun.env,
		);
	}

	require<Key extends keyof typeof this.config>(
		key: Key,
	): (typeof this.config)[Key] {
		return this.config[key];
	}
}
