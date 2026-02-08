import { Assets } from "@/facades/assets";
import { Cache } from "@/facades/cache";
import { Config } from "@/facades/config";
import { Notifier } from "@/facades/notifier";
import { Exception } from "@/general/exception";
import { type User, Users } from "@/repos/users";
import { Strings } from "@/utils/strings";
import { inject, singleton } from "tsyringe";

@singleton()
export class Auth {
	constructor(
		@inject(Users) private users: Users,
		@inject(Cache) private cache: Cache,
		@inject(Config) private config: Config,
		@inject(Assets) private assets: Assets,
		@inject(Strings) private strings: Strings,
		@inject(Notifier) private notifier: Notifier,
	) {}

	async signup(
		email: User["email"],
		password: User["password"],
	): Promise<void> {
		let user = await this.users.findWhere({ email });

		if (!user) {
			user = await this.users.create({
				email,
				password: await this.strings.hash(password),
				name: `user_${await this.strings.random(3)}`,
			});
		} else if (!user.confirmed) {
			user = await this.users.update(
				{ email },
				{ password: await this.strings.hash(password) },
			);
		} else {
			throw new Exception(
				"Вы не можете использовать данный адрес эл.почты",
				"Unauthorized",
			);
		}

		await this.sendOtp(user);
	}

	async login(email: User["email"], password: User["password"]): Promise<User> {
		const user = await this.users.findWhere({ email });

		if (!user || !(await this.strings.verifyHash(password, user.password))) {
			throw new Exception("Неверный адрес эл.почты или пароль", "Unauthorized");
		}
		if (!user.confirmed) {
			await this.sendOtp(user);
			throw new Exception("Необходимо подтверждение эл.почты", "Unauthorized");
		}

		return user;
	}

	async sendOtp(emailOrUser: User["email"] | User): Promise<void> {
		let user: User;

		if (typeof emailOrUser === "string") {
			const existsUser = await this.users.findWhere({ email: emailOrUser });

			if (!existsUser) {
				return;
			}

			user = existsUser;
		} else {
			user = emailOrUser;
		}

		const otp = await this.strings.random(3);

		await this.cache.set(
			`otp:user_id:${user.id}`,
			otp,
			+this.config.require("OTP_TTL_SEC"),
		);
		await this.notifier.notify(
			user.email,
			await this.assets.get("notifs/otp", { otp }),
		);
	}

	async verifyOtp(otp: string, email: User["email"]): Promise<User> {
		const user = await this.users.findWhere({ email });
		const cachedOtp =
			user && (await this.cache.deduct<string>(`otp:user_id:${user.id}`));

		if (!user || !cachedOtp || !this.strings.compare(cachedOtp, otp)) {
			throw new Exception("Неверный или просроченный код", "Unauthorized");
		}
		if (!user.confirmed) {
			return this.users.update({ email }, { confirmed: true });
		}

		return user;
	}

	async changePassword(
		otp: string,
		email: User["email"],
		newPassword: User["password"],
	): Promise<void> {
		const user = await this.verifyOtp(email, otp);

		if (user) {
			this.users.update(
				{ email },
				{ password: await this.strings.hash(newPassword) },
			);
		}
	}
}
