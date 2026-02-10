import { Cache } from "@/adapters/cache";
import { Config } from "@/adapters/config";
import { Notifier } from "@/adapters/notifier";
import { Exception } from "@/general/exception";
import { type User, Users } from "@/repos/users";
import { Strings } from "@/utils/strings";
import { Time } from "@/utils/time";
import { inject, singleton } from "tsyringe";

enum CodePurpose {
	Authenticate = "Authenticate",
	Reset = "reset",
}

@singleton()
export class Auth {
	constructor(
		@inject(Time) private time: Time,
		@inject(Users) private users: Users,
		@inject(Cache) private cache: Cache,
		@inject(Config) private config: Config,
		@inject(Strings) private strings: Strings,
		@inject(Notifier) private notifier: Notifier,
	) {}

	async register(email: string, password: string): Promise<void> {
		let user = await this.users.find({ email });

		if (!user) {
			user = await this.users.create({
				email,
				password: await this.strings.hash(password),
				name: `user_${await this.strings.random(3)}`,
			});
		} else if (!user.confirmed) {
			user = await this.users.update(
				{ id: user.id },
				{ password: await this.strings.hash(password) },
			);
		} else {
			throw new Exception(
				"Вы не можете использовать данный адрес эл.почты",
				"Conflict",
			);
		}

		await this.sendCode(CodePurpose.Authenticate, user);
	}

	async authenticate(
		email: User["email"],
		password: User["password"],
	): Promise<User> {
		const user = await this.users.find({ email });

		if (!user || !(await this.strings.verifyHash(password, user.password))) {
			throw new Exception("Неверный адрес эл.почты или пароль", "Unauthorized");
		}
		if (!user.confirmed) {
			await this.sendCode(CodePurpose.Authenticate, user);
			throw new Exception("Требуется подтверждение эл.почты", "Forbidden");
		}

		return user;
	}

	async initiateCodeAuthenticate(email: string): Promise<void> {
		const user = await this.users.find({ email });

		if (user) {
			await this.sendCode(CodePurpose.Authenticate, user);
		}
	}

	async completeCodeAuthenticate(code: string, email: string): Promise<User> {
		return await this.verifyCode(CodePurpose.Authenticate, code, email);
	}

	async initiateReset(email: string): Promise<void> {
		const user = await this.users.find({ email });

		if (user) {
			await this.sendCode(CodePurpose.Reset, user);
		}
	}

	async completeReset(
		code: string,
		email: string,
		newPassword: string,
	): Promise<void> {
		const user = await this.verifyCode(CodePurpose.Reset, code, email);

		await this.users.update(
			{ id: user.id },
			{ password: await this.strings.hash(newPassword) },
		);
	}

	private async sendCode(purpose: CodePurpose, user: User): Promise<void> {
		const code = await this.strings.random(3);
		const lifetime = this.config.require("AUTH_LIFETIME");

		await this.cache.set(`auth:${purpose}:${user.id}`, code, lifetime);
		await this.notifier.sendPasswordReset(user.email, {
			code,
			ttlMin: this.time.toMin(lifetime),
		});
	}

	private async verifyCode(
		purpose: CodePurpose,
		code: string,
		email: string,
	): Promise<User> {
		const user = await this.users.find({ email });
		const cachedCode =
			user && (await this.cache.consume(`auth:${purpose}:${user.id}`));

		if (!cachedCode || !this.strings.compare(cachedCode, code.trim())) {
			throw new Exception(
				"Неверный или просроченный код",
				"Unprocessable Content",
			);
		}

		if (!user.confirmed) {
			return this.users.update({ id: user.id }, { confirmed: true });
		}

		return user;
	}
}
