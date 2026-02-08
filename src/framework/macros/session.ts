import { Config } from "@/facades/config";
import { Sessions } from "@/facades/sessions";
import { Elysia, t } from "elysia";
import { container } from "tsyringe";

export const session = new Elysia()
	.model({
		sessionUser: t.Object({ id: t.String() }, { additionalProperties: true }),
	})
	.decorate("$sessions", container.resolve(Sessions))
	.decorate("$config", container.resolve(Config))
	.macro("initializeSession", {
		cookie: t.Cookie({ sessionId: t.Optional(t.String()) }),
		response: "sessionUser",
		async afterHandle({ $sessions, $config, request, cookie, responseValue }) {
			const sessionId = await $sessions.initialize({
				userAgent: request.headers.get("user-agent"),
				userId: responseValue.id,
			});

			cookie.sessionId.set({
				value: sessionId,
				httpOnly: true,
				sameSite: "strict",
				maxAge: $config.require("SESSION_TTL_SEC"),
				secrets: $config.require("SESSION_SECRET"),
			});
		},
	})
	.macro("provideSession", {
		cookie: t.Cookie({
			sessionId: t.Intersect([
				t.String({ minLength: 1, error: "Сессия не предоставлена" }),
				t.String({ minLength: 32, error: "Некорректный идетификатор сессии" }),
				t.String({ maxLength: 32, error: "Некорректный идетификатор сессии" }),
			]),
		}),
		async resolve({ $sessions, cookie }) {
			return { session: await $sessions.get(cookie.sessionId.value) };
		},
	});
