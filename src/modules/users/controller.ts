import { session } from "@/framework/macros/session";
import { Elysia } from "elysia";

export const usersController = new Elysia({ prefix: "users" })
	.use(session)

	.get("/me", ({ session }) => session, { withSession: true });
