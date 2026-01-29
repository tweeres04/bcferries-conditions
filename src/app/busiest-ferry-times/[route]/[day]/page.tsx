import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getRouteBySlug } from '../../../should-i-reserve/routeMapping'
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
				<DailySummaryTable dow={dow} route={routeInfo.code} />
			</Suspense>

			<CheckSpecificDateCTA
				href={`/?route=${routeInfo.code}&day=${day.toLowerCase()}`}
			/>

			<Footer />
		</div>
	)
}
