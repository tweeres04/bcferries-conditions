import type { MetadataRoute } from 'next'
import {
	getAllRouteCodes,
	getAllRouteSlugs,
} from './should-i-reserve/routeMapping'
import { getUniqueHolidays, getNextOccurrence } from './holidays'
import { getAllBlogPostMeta } from './articles/getBlogPosts'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'

	const routePages = getAllRouteCodes().map((code: string) => ({
		url: `${baseUrl}?route=${code}`,
	}))

	const holidayPages = getUniqueHolidays()
		.filter((holiday) => getNextOccurrence(holiday.name))
		.map((holiday) => {
			const query = new URLSearchParams({ holiday: holiday.slug })
			return {
				url: `${baseUrl}?${query.toString()}`,
			}
		})

	const holidayRoutePages = getUniqueHolidays()
		.filter((holiday) => getNextOccurrence(holiday.name))
		.flatMap((holiday) => {
			return getAllRouteCodes().map((route: string) => {
				const query = new URLSearchParams({ holiday: holiday.slug, route })
				return {
					url: `${baseUrl}?${query.toString()}`,
				}
			})
		})

	// Add stable recurring day-of-week pages (Friday, Saturday, Sunday, Monday are peak)
	const days = ['friday', 'saturday', 'sunday', 'monday']
	const peakDayPages = days.flatMap((day) => {
		return getAllRouteCodes().map((route) => ({
			url: `${baseUrl}?route=${route}&day=${day}`,
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
				url: `${baseUrl}?route=${route}&day=${day}&sailing=${sailing}`,
			}))
		})
	})

	// Add busiest ferry times pages
	const allDays = [
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday',
	]
	const busiestFerryTimesHub = {
		url: `${baseUrl}/busiest-ferry-times`,
	}
	const busiestFerryTimesPages = getAllRouteSlugs().flatMap((routeSlug) => {
		return allDays.map((day) => ({
			url: `${baseUrl}/busiest-ferry-times/${routeSlug}/${day}`,
		}))
	})

	// Add articles pages
	const articlesHub = {
		url: `${baseUrl}/articles`,
	}
	const articlePosts = getAllBlogPostMeta().map((post) => ({
		url: `${baseUrl}/articles/${post.slug}`,
		lastModified: new Date(post.date),
	}))

	const allPages = [
		{
			url: baseUrl,
		},
		{
			url: `${baseUrl}/history`,
		},
		...routePages,
		...holidayPages,
		...holidayRoutePages,
		...peakDayPages,
		...peakSailingPages,
		busiestFerryTimesHub,
		...busiestFerryTimesPages,
		articlesHub,
		...articlePosts,
	]

	return allPages
		.filter((page) => page.url)
		.map((page) => ({
			...page,
			url: page.url.replace(/&/g, '&amp;'),
		}))
}


