import { Container, Tailwind, Text } from "@react-email/components";

export function Layout(props: React.PropsWithChildren): React.ReactElement {
	return (
		<Tailwind>
			<Container className="font-sans">
				<Container>{props.children}</Container>
				<Text className="text-center font-bold text-gray-400">vdchan</Text>
			</Container>
		</Tailwind>
	);
}
