import { singleton } from "tsyringe";

@singleton()
export class Assets {
	async get(path: string, payload?: any): Promise<any> {
		const asset = await import(`@/assets/${path}`);
		return asset.default(payload);
	}
}
