import { Metadata } from 'next'
import Link from 'next/link'
import {
	getAllRouteSlugs,
	getRouteBySlug,
} from '../should-i-reserve/routeMapping'
import { Button } from '@/components/ui/button'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import CheckSpecificDateCTA from './CheckSpecificDateCTA'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
	title: 'Which ferries fill up? - BC Ferries Conditions Analytics',
	description:
		'See which BC Ferries sailings typically fill up so you know when to book ahead and when you can probably just show up.',
	alternates: {
		canonical: 'https://bcferries-conditions.tweeres.ca/busiest-ferry-times',
	},
	openGraph: {
		title: 'Which ferries fill up? - BC Ferries Conditions',
		description:
			'See which BC Ferries sailings typically fill up so you know when to book ahead and when you can probably just show up.',
		url: 'https://bcferries-conditions.tweeres.ca/busiest-ferry-times',
	},
}

const DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
]

export default function BusiestFerryTimesHub() {
	const routeSlugs = getAllRouteSlugs()

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/">Home</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Busiest Ferry Times</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="text-3xl font-bold mb-4">Which ferries fill up?</h1>

			<div className="prose max-w-none mb-16">
				<p>
					See which sailings typically fill up so you know when to book ahead
					and when you can probably just show up.
				</p>
			</div>

			<div className="space-y-20">
				{routeSlugs.map((slug) => {
					const routeInfo = getRouteBySlug(slug)
					if (!routeInfo) return null

					return (
						<div key={slug}>
							<h2 className="text-xl font-semibold mb-4">
								{routeInfo.fromShort} to {routeInfo.toShort}
							</h2>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{DAYS.map((day) => (
									<Button key={day} variant="outline" asChild>
										<Link href={`/busiest-ferry-times/${slug}/${day}`}>
											{day.charAt(0).toUpperCase() + day.slice(1)}
										</Link>
									</Button>
								))}
							</div>
						</div>
					)
				})}
			</div>

			<CheckSpecificDateCTA href="/" />

			<Footer />
		</div>
	)
}
