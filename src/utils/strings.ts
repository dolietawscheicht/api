import crypto from "crypto";
import { singleton } from "tsyringe";

@singleton()
export class Strings {
	random(bytes: number, encoding: BufferEncoding = "hex"): Promise<string> {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(bytes, (error, buffer) => {
				if (error) {
					reject(error);
				} else {
					resolve(buffer.toString(encoding));
				}
			});
		});
	}

	compare(a: string, b: string): boolean {
		return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
	}

	async hash(plain: string): Promise<string> {
		return await Bun.password.hash(plain);
	}

	async verifyHash(plain: string, hash: string): Promise<boolean> {
		return await Bun.password.verify(plain, hash);
	}
}
