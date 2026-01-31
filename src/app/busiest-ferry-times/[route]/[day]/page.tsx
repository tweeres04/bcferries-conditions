import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
	getRouteBySlug,
	getOppositeRouteSlug,
} from '../../../should-i-reserve/routeMapping'
import { capitalizeDay } from '../../../should-i-reserve/helpers'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import DailySummaryTable from '../../../should-i-reserve/DailySummaryTable'
import DailySummaryTableSkeleton from '../../../should-i-reserve/DailySummaryTableSkeleton'
import CheckSpecificDateCTA from '../../CheckSpecificDateCTA'
import Footer from '@/components/Footer'

type Props = {
	params: {
		route: string
		day: string
	}
}

const VALID_DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
]

const DAY_TO_DOW: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { route, day } = params
	const routeInfo = getRouteBySlug(route)

	if (!routeInfo || !VALID_DAYS.includes(day.toLowerCase())) {
		return {}
	}

	const dayCapitalized = capitalizeDay(day)
	const title = `How full are ${dayCapitalized} ferries from ${routeInfo.fromShort}? - BC Ferries Conditions Analytics`
	const description = `See how often each ${dayCapitalized} sailing from ${routeInfo.fromShort} to ${routeInfo.toShort} fills up. Know when to book ahead and when you can just show up.`

	return {
		title,
		description,
		openGraph: {
			title,
			description,
		},
	}
}

export default function BusiestFerryTimesPage({ params }: Props) {
	const { route, day } = params
	const routeInfo = getRouteBySlug(route)
	const dow = DAY_TO_DOW[day.toLowerCase()]

	if (
		!routeInfo ||
		dow === undefined ||
		!VALID_DAYS.includes(day.toLowerCase())
	) {
		notFound()
	}

	const dayCapitalized = capitalizeDay(day)
	const oppositeRouteSlug = getOppositeRouteSlug(route)
	const oppositeRouteInfo = oppositeRouteSlug
		? getRouteBySlug(oppositeRouteSlug)
		: undefined

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/">Home</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/busiest-ferry-times">Busiest Ferry Times</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>
							{routeInfo.fromShort} to {routeInfo.toShort} - {dayCapitalized}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="text-3xl font-bold mb-4">
				How full are {dayCapitalized} ferries from {routeInfo.fromShort}?
			</h1>

			<div className="prose max-w-none mb-8">
				<p>
					Here&rsquo;s how often each {dayCapitalized} sailing fills up. Red
					means it&rsquo;s usually full, so you might want to book ahead.
				</p>
			</div>

			<Suspense fallback={<DailySummaryTableSkeleton />}>
				<DailySummaryTable
					dow={dow}
					route={routeInfo.code}
					baseUrl="/"
					day={day.toLowerCase()}
				/>
			</Suspense>

			<div className="flex gap-2 text-sm mt-8 flex-wrap">
				{VALID_DAYS.map((d) => (
					<span key={d}>
						{d === day.toLowerCase() ? (
							<span className="text-gray-900 font-medium">
								{capitalizeDay(d)}
							</span>
						) : (
							<Link
								href={`/busiest-ferry-times/${route}/${d}`}
								className="text-gray-600 hover:text-gray-900 underline"
							>
								{capitalizeDay(d)}
							</Link>
						)}
						{d !== 'sunday' && <span className="text-gray-400 ml-2">|</span>}
					</span>
				))}
			</div>

			{oppositeRouteInfo && (
				<div className="mt-16 text-sm text-gray-600">
					Planning a return trip?{' '}
					<Link
						href={`/busiest-ferry-times/${oppositeRouteSlug}/${day.toLowerCase()}`}
						className="content-link"
					>
						Check {oppositeRouteInfo.fromShort} to {oppositeRouteInfo.toShort}{' '}
						on {dayCapitalized} →
					</Link>
				</div>
			)}

			<CheckSpecificDateCTA
				href={`/?route=${routeInfo.code}&day=${day.toLowerCase()}`}
			/>

			<Footer />
		</div>
	)
}
