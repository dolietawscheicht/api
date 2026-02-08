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

const otp = t.Intersect([
	t.String({ minLength: 6, error: "Минимальная длина кода - 6 символов" }),
	t.String({ maxLength: 6, error: "Максимальная длина кода - 6 символов" }),
]);

export const authModel = new Elysia().model({
	login: t.Object(
		{ email, password },
		{ error: "Для входа необходимо указать aдрес эл.почты и пароль" },
	),
	signup: t.Object(
		{ email, password },
		{ error: "Для регистрации необходимо указать aдрес эл.почты и пароль" },
	),
	sendOtp: t.Object(
		{ email },
		{ error: "Для получения кода необходимо указать aдрес эл.почты" },
	),
	verifyOtp: t.Object(
		{ otp, email },
		{ error: "Для проверки кода необходимо указать код и aдрес эл.почты" },
	),
	changePassword: t.Object(
		{ otp, email, newPassword: password },
		{
			error:
				"Для смены пароля необходимо указать код, aдрес эл.почты и новый пароль",
		},
	),
});
