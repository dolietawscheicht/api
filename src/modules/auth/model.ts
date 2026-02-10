import { Elysia, t } from "elysia";

const email = t.Intersect([
	t.String({ minLength: 1, error: "Адрес эл.почты обязателен для заполнения" }),
	t.String({ format: "email", error: "Укажите корректный адрес эл.почты" }),
]);
const password = t.Intersect([
	t.String({ minLength: 1, error: "Пароль обязателен для заполнения" }),
	t.String({ minLength: 6, error: "Минимальная длина пароля - 6 символов" }),
	t.String({ maxLength: 32, error: "Максимальная длина пароля - 32 символа" }),
]);
const code = t.Intersect([
	t.String({ minLength: 6, error: "Минимальная длина кода - 6 символов" }),
	t.String({ maxLength: 6, error: "Максимальная длина кода - 6 символов" }),
]);

export const authModel = new Elysia().model({
	signup: t.Object({ email, password }),
	login: t.Object({ email, password }),
	loginCodeInitiate: t.Object({ email }),
	loginCodeComplete: t.Object({ code, email }),
	resetInitiate: t.Object({ email }),
	resetComplete: t.Object({ code, email, newPassword: password }),
});
