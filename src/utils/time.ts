import ms, { type StringValue } from "ms";
import { singleton } from "tsyringe";
import * as v from "valibot";

export type Duration = string & StringValue;

@singleton()
export class Time {
	readonly durationSchema = v.pipe(
		v.string(),
		v.check((input: any) => isNaN(Number(input)) && !isNaN(this.toMs(input))),
	) as v.BaseSchema<unknown, Duration, v.BaseIssue<Duration>>;

	toMs(duration: Duration): number {
		return ms(duration);
	}

	toSec(duration: Duration): number {
		return ms(duration) / 1000;
	}

	toMin(duration: Duration): number {
		return ms(duration) / (1000 * 60);
	}
}
