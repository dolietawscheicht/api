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

	async notify(reciver: string, notif: string): Promise<void> {
		this.notifier.sendMail({
			to: reciver,
			html: notif,
		});
	}
}
