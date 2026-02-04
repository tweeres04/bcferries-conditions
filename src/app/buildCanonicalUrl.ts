import { getNextOccurrence } from './holidays'

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
		canonicalParams.set('date', date)
	}

	const queryString = canonicalParams.toString()
	return queryString
		? `https://bcferries-conditions.tweeres.ca/?${queryString}`
		: 'https://bcferries-conditions.tweeres.ca/'
}
