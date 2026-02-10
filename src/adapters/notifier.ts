import { getEmailConfirmationHtml } from "@/assets/notifs/email-confirmation";
import { getPasswordResetHtml } from "@/assets/notifs/password-reset";
import { createTransport } from "nodemailer";
import { inject, singleton } from "tsyringe";
import { Config } from "./config";

@singleton()
export class Notifier {
	private notifier;

	constructor(@inject(Config) config: Config) {
		this.notifier = createTransport(
			{ url: config.require("MAIL_URL") },
			{
				from: config.require("MAIL_FROM"),
				subject: config.require("APP_NAME"),
			},
		);
	}

	async sendEmailConfirmation(
		reciver: string,
		payload: Parameters<typeof getEmailConfirmationHtml>[0],
	): Promise<void> {
		await this.notifier.sendMail({
			to: reciver,
			html: await getEmailConfirmationHtml(payload),
		});
	}

	async sendPasswordReset(
		reciver: string,
		payload: Parameters<typeof getPasswordResetHtml>[0],
	): Promise<void> {
		await this.notifier.sendMail({
			to: reciver,
			html: await getPasswordResetHtml(payload),
		});
	}
}
