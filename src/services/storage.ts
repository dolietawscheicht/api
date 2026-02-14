import { Time, type Duration } from "@/utils/time";
import { inject, singleton } from "tsyringe";
import { Config } from "./config";

@singleton()
export class Storage {
	private storage;

	constructor(
		@inject(Config) config: Config,
		@inject(Time) private time: Time,
	) {
		this.storage = new Bun.S3Client({
			accessKeyId: config.require("S3_ACCESS_KEY_ID"),
			secretAccessKey: config.require("S3_SECRET_ACCESS_KEY"),
			sessionToken: config.require("S3_SESSION_TOKEN"),
			endpoint: config.require("S3_ENDPOINT"),
			bucket: config.require("S3_BUCKET"),
			region: config.require("S3_REGION"),
		});
	}

	async upload(path: string, file: File): Promise<void> {
		await this.storage.write(path, file);
	}

	presign(path: string, duration?: Duration): string {
		return this.storage.presign(path, {
			expiresIn: duration && this.time.toSec(duration),
		});
	}
}
