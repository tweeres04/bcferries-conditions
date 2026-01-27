import { Metadata } from 'next'
import Link from 'next/link'
import { getAllRouteSlugs, getRouteBySlug } from '../should-i-reserve/routeMapping'

export const metadata: Metadata = {
	title: 'Busiest Ferry Times - BC Ferries Conditions',
	description:
		'Find out which BC Ferries sailings are most likely to fill up, based on historical data from the past 12 weeks.',
	openGraph: {
		title: 'Busiest Ferry Times - BC Ferries Conditions',
		description:
			'Find out which BC Ferries sailings are most likely to fill up, based on historical data from the past 12 weeks.',
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
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<nav className="text-sm text-gray-600 mb-4">
				<Link href="/" className="hover:underline">
					Home
				</Link>
				{' / '}
				<span>Busiest Ferry Times</span>
			</nav>

			<h1 className="text-3xl font-bold mb-4">Busiest Ferry Times</h1>

			<div className="prose max-w-none mb-8">
				<p>
					Find out which BC Ferries sailings are most likely to fill up, based
					on historical data from the past 12 weeks. Select a route and day of
					the week to see detailed capacity information.
				</p>
			</div>

			<div className="space-y-8">
				{routeSlugs.map((slug) => {
					const routeInfo = getRouteBySlug(slug)
					if (!routeInfo) return null

					return (
						<div key={slug} className="border rounded-lg p-6">
							<h2 className="text-xl font-semibold mb-4">
								{routeInfo.fromShort} to {routeInfo.toShort}
							</h2>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{DAYS.map((day) => (
									<Link
										key={day}
										href={`/busiest-ferry-times/${slug}/${day}`}
										className="block px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-center transition-colors"
									>
										{day.charAt(0).toUpperCase() + day.slice(1)}
									</Link>
								))}
							</div>
						</div>
					)
				})}
			</div>

			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h2 className="text-lg font-semibold mb-2">
					Want to check a specific date?
				</h2>
				<p className="text-sm text-gray-700 mb-3">
					Use our interactive tool to see historical data for a specific sailing
					and date.
				</p>
				<Link
					href="/should-i-reserve"
					className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
				>
					View Interactive Tool →
				</Link>
			</div>
		</div>
	)
}
