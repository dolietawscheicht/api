import { render, Text } from "@react-email/components";
import { Layout } from "./includes/layout";

export function getPasswordResetHtml(props: {
	code: string;
	ttlMin: number;
}): Promise<string> {
	return render(
		<Layout>
			<Text className="text-3xl text-center">{props.code}</Text>
			<Text className="text-center">
				Код действителен в течение {props.ttlMin} минут
			</Text>
		</Layout>,
	);
}
