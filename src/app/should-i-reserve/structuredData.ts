import { formatTime } from '../formatTime'

type RouteInfo = {
	code: string
	from: string
	to: string
	fromShort: string
	toShort: string
}

const BASE_URL = 'https://bcferries-conditions.tweeres.ca'

export function generateBreadcrumbSchema({
	route,
	routeInfo,
	day,
	sailing,
}: {
	route?: string
	routeInfo?: RouteInfo
	day?: string
	sailing?: string
}) {
	const breadcrumbs = [
		{ name: 'Home', item: `${BASE_URL}/` },
		{
			name: 'Should I Reserve?',
			item: `${BASE_URL}/should-i-reserve`,
		},
	]

	if (routeInfo && route) {
		const params = new URLSearchParams({ route })
		breadcrumbs.push({
			name: `${routeInfo.fromShort} to ${routeInfo.toShort}`,
			item: `${BASE_URL}/should-i-reserve?${params.toString()}`,
		})
	}

	if (day) {
		const params = new URLSearchParams()
		if (route) params.set('route', route)
		params.set('day', day)
		breadcrumbs.push({
			name: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
			item: `${BASE_URL}/should-i-reserve?${params.toString()}`,
		})
	}

	if (sailing) {
		const params = new URLSearchParams()
		if (route) params.set('route', route)
		if (day) params.set('day', day)
		params.set('sailing', sailing)
		breadcrumbs.push({
			name: formatTime(sailing),
			item: `${BASE_URL}/should-i-reserve?${params.toString()}`,
		})
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((b, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: b.name,
			item: b.item,
		})),
	}
}

export function generateFaqSchema({
	routeInfo,
	sailing,
	day,
}: {
	routeInfo?: RouteInfo
	sailing?: string
	day?: string
}) {
	const faqs: Array<{
		'@type': string
		name: string
		acceptedAnswer: {
			'@type': string
			text: string
		}
	}> = []

	if (routeInfo && sailing) {
		const time = formatTime(sailing)
		const dayName = day
			? `${day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}s`
			: 'this day'
		faqs.push({
			'@type': 'Question',
			name: `Should I reserve the ${time} ferry from ${routeInfo.fromShort} to ${routeInfo.toShort} on ${dayName}?`,
			acceptedAnswer: {
				'@type': 'Answer',
				text: `Based on historical data for the ${time} sailing from ${routeInfo.from} to ${routeInfo.to}, you can see how often this sailing fills up and decide if a reservation is necessary. Typically, peak times on weekends and holidays are more likely to require reservations.`,
			},
		})
	}

	if (faqs.length === 0) {
		return null
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs,
	}
}
