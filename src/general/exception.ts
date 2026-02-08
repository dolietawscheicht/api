import { StatusMap } from "elysia";

export class Exception extends Error {
	constructor(
		message: string,
		readonly status: keyof StatusMap,
	) {
		super(message);
	}
}
