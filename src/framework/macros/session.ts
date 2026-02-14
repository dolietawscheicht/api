import { Config } from "@/services/config";
import { Sessions } from "@/services/sessions";
import { Exception } from "@/general/exception";
import { Time } from "@/utils/time";
import { Elysia, t } from "elysia";
import { container } from "tsyringe";

export const session = new Elysia()
	.model({
		sessionUser: t.Object({ id: t.String() }, { additionalProperties: true }),
	})

	.decorate("$time", container.resolve(Time))
	.decorate("$config", container.resolve(Config))
	.decorate("$sessions", container.resolve(Sessions))

	.macro("initializeSession", {
		cookie: t.Cookie({ sessionId: t.Optional(t.String()) }),
		response: "sessionUser",
		async afterHandle({
			$time,
			$config,
			$sessions,
			request,
			cookie,
			responseValue,
		}) {
			const sessionId = await $sessions.initialize({
				userId: responseValue.id,
				agent: request.headers.get("user-agent") || "null",
			});

			cookie.sessionId.set({
				value: sessionId,
				httpOnly: true,
				sameSite: "strict",
				maxAge: $time.toSec($config.require("SESSION_LIFETIME")),
				secrets: $config.require("SESSION_SECRET"),
			});
		},
	})

	.macro("withSession", {
		cookie: t.Cookie({
			sessionId: t.Intersect([
				t.String({ minLength: 1, error: "Сессия не предоставлена" }),
				t.String({ minLength: 32, error: "Некорректный идетификатор сессии" }),
				t.String({ maxLength: 32, error: "Некорректный идетификатор сессии" }),
			]),
		}),
		async resolve({ $sessions, cookie }) {
			const session = await $sessions.find(cookie.sessionId.value);

			if (session) {
				return { session };
			}

			throw new Exception("Доступ запрещен", "Forbidden");
		},
	})

	.macro("withSessions", {
		withSession: true,
		async resolve({ $sessions, session }) {
			return {
				sessions: await $sessions.findAll(session.userId),
			};
		},
	})

	.macro("withLogout", {
		withSessions: true,
		async afterHandle({ $sessions, session }) {
			await $sessions.destroy(session.sessionId);
		},
	})

	.macro("withFullLogout", {
		withSessions: true,
		async afterHandle({ $sessions, session }) {
			await $sessions.destroyAll(session.userId);
		},
	});
