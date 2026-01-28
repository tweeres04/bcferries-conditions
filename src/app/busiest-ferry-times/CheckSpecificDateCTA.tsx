import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
	href: string
}

export default function CheckSpecificDateCTA({ href }: Props) {
	return (
		<div className="mt-20">
			<h2 className="text-xl font-semibold mb-2">Checking a specific date?</h2>
			<p className="text-muted-foreground mb-4">
				See how full your sailing usually gets and decide if you need a
				reservation.
			</p>
			<Button asChild variant="secondary">
				<Link href={href}>Check a specific sailing →</Link>
			</Button>
		</div>
	)
}
