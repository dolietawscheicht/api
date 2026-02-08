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

	compare(a: string, b: string) {
		return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
	}

	hash(plain: string): Promise<string> {
		return Bun.password.hash(plain);
	}

	verifyHash(plain: string, hash: string): Promise<boolean> {
		return Bun.password.verify(plain, hash);
	}
}
