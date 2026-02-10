import { session } from "@/framework/macros/session";
import { Elysia } from "elysia";
import { container } from "tsyringe";
import { authModel } from "./model";
import { Auth } from "./service";

export const authController = new Elysia({ prefix: "auth" })
	.use(session)
	.use(authModel)

	.decorate("$auth", container.resolve(Auth))

	.post(
		"/signup",
		async ({ $auth, body }) => {
			await $auth.register(body.email, body.password);
			return "Код для завершения регистрации отправлен на вашу эл.почту";
		},
		{ body: "signup" },
	)

	.post(
		"/login",
		async ({ $auth, body }) => {
			const { password, ...user } = await $auth.authenticate(
				body.email,
				body.password,
			);
			return user;
		},
		{ body: "login", initializeSession: true, response: "sessionUser" },
	)

	.post(
		"/login/code/initiate",
		async ({ $auth, body }) => {
			await $auth.initiateCodeAuthenticate(body.email);
			return "Код для вход отправлен на вашу эл.почту";
		},
		{ body: "loginCodeInitiate" },
	)

	.post(
		"/login/code/complete",
		async ({ $auth, body }) => {
			const { password, ...user } = await $auth.completeCodeAuthenticate(
				body.code,
				body.email,
			);
			return user;
		},
		{
			body: "loginCodeComplete",
			initializeSession: true,
			response: "sessionUser",
		},
	)

	.post(
		"/reset/initiate",
		async ({ $auth, body }) => {
			await $auth.initiateReset(body.email);
			return "Код для сброса пароля отправлен на вашу эл.почту";
		},
		{ body: "resetInitiate" },
	)

	.post(
		"/reset/complete",
		async ({ $auth, body }) => {
			await $auth.completeReset(body.code, body.email, body.newPassword);
			return "Пароль успешно изменен";
		},
		{ body: "resetComplete" },
	)

	.post("/sessions/current/logout", () => true, { withLogout: true })

	.post("/sessions/all/logout", () => true, { withFullLogout: true })

	.get("/sessions", ({ sessions }) => sessions, { withSessions: true });
