import type { MetadataRoute } from 'next'
import { getAllRouteCodes } from './should-i-reserve/routeMapping'
import { getUniqueHolidays, getNextOccurrence } from './holidays'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'

	const routePages = getAllRouteCodes().map((code: string) => ({
		url: `${baseUrl}/should-i-reserve?route=${code}`,
	}))

	const holidayPages = getUniqueHolidays().map((holiday) => {
		const nextDate = getNextOccurrence(holiday.name)
		const query = new URLSearchParams({ holiday: holiday.slug })
		if (nextDate) query.set('date', nextDate)
		return {
			url: `${baseUrl}/should-i-reserve?${query.toString()}`,
		}
	})

	const holidayRoutePages = getUniqueHolidays().flatMap((holiday) => {
		const nextDate = getNextOccurrence(holiday.name)
		return getAllRouteCodes().map((route: string) => {
			const query = new URLSearchParams({ holiday: holiday.slug, route })
			if (nextDate) query.set('date', nextDate)
			return {
				url: `${baseUrl}/should-i-reserve?${query.toString()}`,
			}
		})
	})

	return [
		{
			url: baseUrl,
		},
		{
			url: `${baseUrl}/should-i-reserve`,
		},
		...routePages,
		...holidayPages,
		...holidayRoutePages,
	]
}
