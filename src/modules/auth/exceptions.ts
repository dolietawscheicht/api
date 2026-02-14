import { Exception } from "@/general/exception";

export const exceptions = {
	UnavailableEmail: class extends Exception {
		constructor() {
			super("Вы не можете использовать данный адрес эл.почты", "Conflict");
		}
	},
	InvalidCredentials: class extends Exception {
		constructor() {
			super("Неверный адрес эл.почты или пароль", "Unauthorized");
		}
	},
	InvalidOrExpiredCode: class extends Exception {
		constructor() {
			super("Неверный или просроченный код", "Unprocessable Content");
		}
	},
	ConfirmationReqired: class extends Exception {
		constructor() {
			super("Требуется подтверждение эл.почты", "Forbidden");
		}
	},
};
