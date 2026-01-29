import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BrowseBusiestTimesCTA() {
	return (
		<div className="mt-20">
			<h2 className="text-xl font-semibold mb-2">Want to browse typical patterns?</h2>
			<p className="text-muted-foreground mb-4">
				See which sailings fill up most often and plan around the busy times.
			</p>
			<Button asChild variant="secondary">
				<Link href="/busiest-ferry-times">Browse busiest ferry times →</Link>
			</Button>
		</div>
	)
}
