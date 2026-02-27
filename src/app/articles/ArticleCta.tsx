import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

type Props = {
	href?: string
	title?: string
	description?: string
	buttonText?: string
}

export default function ArticleCta({
	href = '/',
	title = 'Check your specific sailing',
	description = 'See how often any sailing fills up on your travel day.',
	buttonText = 'Look up your sailing',
}: Props) {
	return (
		<Card className="not-prose my-8">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<Button asChild>
					<Link href={href}>{buttonText}</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
