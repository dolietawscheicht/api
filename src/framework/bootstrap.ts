import { Exception } from "@/general/exception";
import { authController } from "@/modules/auth/controller";
import { usersController } from "@/modules/users/controller";
import { Config } from "@/services/config";
import cors from "@elysiajs/cors";
import { Elysia, StatusMap } from "elysia";
import { container } from "tsyringe";

const config = container.resolve(Config);

export const bootstrap = () => {
	new Elysia()
		.error({ Exception })
		.onError(({ error, code, status }) => {
			console.log(error);

			let message = "Произошла ошибка";
			let statusCode: keyof StatusMap = "Internal Server Error";
			let errors: Record<string, string[]> | undefined;

			switch (code) {
				case "Exception":
					message = error.message;
					statusCode = error.status;
					break;
				case "NOT_FOUND":
					message = "Ресурс не найден";
					statusCode = "Not Found";
					break;
				case "VALIDATION":
					message = "Ошибка валидации";
					statusCode = "Unprocessable Content";
					errors = error.all.reduce(
						(result, { path, message, schema: { error } }) => {
							const errors = result[path] ?? [];

							errors.push(error ? String(error) : message);
							result[path || "root"] = errors;

							return result;
						},
						{} as Record<string, string[]>,
					);
					break;
				case "PARSE":
					message = "Некорректное тело запроса";
					statusCode = "Bad Request";
					break;
			}

			return status(statusCode, { message, errors });
		})
		.use(cors())
		.use([authController, usersController])
		.listen(config.require("APP_PORT"));
};
