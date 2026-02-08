import { Config } from "@/facades/config";
import { render, Text } from "@react-email/components";
import { container } from "tsyringe";
import { Layout } from "./includes/layout";

const config = container.resolve(Config);

export default function otpTemplate(props: { otp: string }): Promise<string> {
	return render(
		<Layout>
			<Text className="text-3xl text-center">{props.otp}</Text>
			<Text className="text-center">
				Код действителен в течение {config.require("OTP_TTL_SEC") / 60} минут
			</Text>
		</Layout>,
	);
}
