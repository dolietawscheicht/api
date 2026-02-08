import { Sessions } from "@/facades/sessions";
import { session } from "@/framework/macros/session";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import { authModel } from "./model";
import { Auth } from "./service";

export const authController = new Elysia({ prefix: "auth" })
	.use(session)
	.use(authModel)
	.decorate("$sessions", container.resolve(Sessions))
	.decorate("$auth", container.resolve(Auth))
	.post(
		"/signup",
		async ({ $auth, body }) => {
			await $auth.signup(body.email, body.password);
			return "Код отправлен на вашу эл.почту";
		},
		{ body: "signup" },
	)
	.post(
		"/login",
		async ({ $auth, body }) => {
			const { password, ...user } = await $auth.login(
				body.email,
				body.password,
			);
			return user;
		},
		{ body: "login", initializeSession: true, response: "sessionUser" },
	)
	.post(
		"/otp/send",
		async ({ $auth, body }) => {
			await $auth.sendOtp(body.email);
			return "Код отправлен на вашу эл.почту";
		},
		{ body: "sendOtp" },
	)
	.post(
		"/otp/verify",
		async ({ $auth, body }) => {
			const { password, ...user } = await $auth.verifyOtp(body.otp, body.email);
			return user;
		},
		{ body: "verifyOtp", initializeSession: true, response: "sessionUser" },
	)
	.patch(
		"/password",
		async ({ $auth, body }) => {
			await $auth.changePassword(body.otp, body.email, body.newPassword);
			return "Пароль успешно изменен";
		},
		{ body: "changePassword" },
	)
	.post(
		"/logout",
		({ $sessions, session }) => {
			return $sessions.destroy(session.id);
		},
		{ provideSession: true },
	)
	.post(
		"/logout/all",
		({ $sessions, session }) => {
			return $sessions.destroyAll(session.userId);
		},
		{ provideSession: true },
	)
	.get(
		"/sessions",
		({ $sessions, session }) => {
			return $sessions.getAll(session.userId);
		},
		{ provideSession: true },
	);
