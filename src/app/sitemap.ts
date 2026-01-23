import type { MetadataRoute } from 'next'
import { getAllRouteCodes } from './should-i-reserve/routeMapping'
import { getUniqueHolidays, getNextOccurrence } from './holidays'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'

	const routePages = getAllRouteCodes().map((code: string) => ({
		url: `${baseUrl}/should-i-reserve?route=${code}`,
	}))

	const holidayPages = getUniqueHolidays()
		.filter((holiday) => getNextOccurrence(holiday.name))
		.map((holiday) => {
			const query = new URLSearchParams({ holiday: holiday.slug })
			return {
				url: `${baseUrl}/should-i-reserve?${query.toString()}`,
			}
		})

	const holidayRoutePages = getUniqueHolidays()
		.filter((holiday) => getNextOccurrence(holiday.name))
		.flatMap((holiday) => {
			return getAllRouteCodes().map((route: string) => {
				const query = new URLSearchParams({ holiday: holiday.slug, route })
				return {
					url: `${baseUrl}/should-i-reserve?${query.toString()}`,
				}
			})
		})

	// Add stable recurring day-of-week pages (Friday, Sunday, Monday are peak)
	const days = ['friday', 'sunday', 'monday']
	const peakDayPages = days.flatMap((day) => {
		return getAllRouteCodes().map((route) => ({
			url: `${baseUrl}/should-i-reserve?route=${route}&day=${day}`,
		}))
	})

	// Add peak sailing times for those peak days
	// Using standard peak times: 7am, 9am, 11am, 1pm, 3pm, 5pm, 7pm
	const peakTimes = [
		'07:00:00',
		'09:00:00',
		'11:00:00',
		'13:00:00',
		'15:00:00',
		'17:00:00',
		'19:00:00',
	]
	const peakSailingPages = days.flatMap((day) => {
		return getAllRouteCodes().flatMap((route) => {
			return peakTimes.map((sailing) => ({
				url: `${baseUrl}/should-i-reserve?route=${route}&day=${day}&sailing=${sailing}`,
			}))
		})
	})

	const allPages = [
		{
			url: baseUrl,
		},
		{
			url: `${baseUrl}/should-i-reserve`,
		},
		...routePages,
		...holidayPages,
		...holidayRoutePages,
		...peakDayPages,
		...peakSailingPages,
	]

	return allPages
		.filter((page) => page.url)
		.map((page) => ({
			...page,
			url: page.url.replace(/&/g, '&amp;'),
		}))
}


