import { getDay } from 'date-fns'
import { TZDate, tz } from '@date-fns/tz'
import { getNextOccurrence } from './holidays'

const DAY_NAMES = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

export type CanonicalUrlParams = {
	route?: string
	sailing?: string
	holidaySlug?: string
	holidayInfo?: { name: string }
	day?: string
	date?: string
	dateParam?: string
}

export function buildCanonicalUrl(params: CanonicalUrlParams): string {
	const { route, sailing, holidaySlug, holidayInfo, day, date, dateParam } =
		params
	const canonicalParams = new URLSearchParams()

	if (route) canonicalParams.set('route', route)
	if (sailing) canonicalParams.set('sailing', sailing)

	if (holidayInfo && holidaySlug) {
		canonicalParams.set('holiday', holidaySlug)
		const nextDate = getNextOccurrence(holidayInfo.name)
		if (date !== nextDate && date) {
			canonicalParams.set('date', date)
		}
	} else if (day) {
		canonicalParams.set('day', day)
		if (dateParam) canonicalParams.set('date', dateParam)
	} else if (date) {
		// Past dates canonicalize to their day-of-week evergreen equivalent.
		// e.g. ?route=TSA-SWB&date=2025-12-21&sailing=17:00:00 → ?route=TSA-SWB&day=sunday&sailing=17:00:00
		// This prevents Google from indexing stale date-specific URLs as separate pages.
		// Today and future dates keep the date as-is — they may have distinct content
		// (e.g. upcoming holiday, summer vs winter schedule).
		const todayStr = TZDate.tz('America/Vancouver').toISOString().slice(0, 10)
		if (date < todayStr) {
			const dow = getDay(new Date(date + 'T00:00:00'), {
				in: tz('America/Vancouver'),
			})
			canonicalParams.set('day', DAY_NAMES[dow])
		} else {
			canonicalParams.set('date', date)
		}
	}

	const queryString = canonicalParams.toString()
	return queryString
		? `https://bcferries-conditions.tweeres.ca?${queryString}`
		: 'https://bcferries-conditions.tweeres.ca'
}
