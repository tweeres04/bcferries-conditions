import { inferDateFromDay } from './should-i-reserve/helpers'
import {
	getHolidayBySlug,
	getNextOccurrence,
	getHolidayForDate,
	getHolidaySlug,
} from './holidays'

type SearchParams = {
	date?: string
	route?: string
	sailing?: string
	holiday?: string
	day?: string
}

function toURLSearchParams(params: SearchParams) {
	return new URLSearchParams(
		Object.fromEntries(
			Object.entries(params).filter(([, v]) => v !== undefined)
		) as Record<string, string>
	)
}

/**
 * Resolves whether the given search params require a redirect for URL canonicalization.
 * Returns the redirect URL string if a redirect is needed, or null if the page should render as-is.
 *
 * This is a pure function extracted from page.tsx to make the redirect logic testable.
 */
export function resolveRedirect(searchParams: SearchParams): string | null {
	const {
		holiday: holidaySlug,
		date: dateParam,
		day,
	} = searchParams

	// If date and day are both provided, redirect to remove day as date is more specific
	if (dateParam && day) {
		const params = toURLSearchParams(searchParams)
		params.delete('day')
		return `/?${params.toString()}`
	}

	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined

	// If an explicit date is provided, check if it's the next occurrence of a holiday and redirect to stable URL if so
	// Only applies when date was explicitly passed as a param (not inferred from day), to avoid redirect loops
	if (dateParam && !holidaySlug) {
		const holidayForDate = getHolidayForDate(dateParam)
		if (holidayForDate) {
			const nextDate = getNextOccurrence(holidayForDate.name)
			if (nextDate === dateParam) {
				const params = toURLSearchParams(searchParams)
				params.set('holiday', getHolidaySlug(holidayForDate.name))
				params.delete('date')
				return `/?${params.toString()}`
			}
		}
	}

	// If an explicit date is provided but doesn't match the holiday, redirect to remove the holiday param
	// Only applies when date was explicitly passed as a param (not inferred from day), to avoid redirect loops
	if (holidaySlug && dateParam) {
		const holidayForDate = getHolidayForDate(dateParam)
		if (getHolidaySlug(holidayForDate?.name ?? '') !== holidaySlug) {
			const params = toURLSearchParams(searchParams)
			params.delete('holiday')
			return `/?${params.toString()}`
		}

		// If it is the holiday and matches the next occurrence, remove the date param for stable URL
		if (holidayInfo) {
			const nextDate = getNextOccurrence(holidayInfo.name)
			if (nextDate === dateParam) {
				const params = toURLSearchParams(searchParams)
				params.delete('date')
				return `/?${params.toString()}`
			}
		}
	}

	return null
}

/**
 * Resolves the effective date from search params.
 * Prefers explicit dateParam over day-inferred date.
 */
export function resolveDate(searchParams: SearchParams): string | undefined {
	const { date: dateParam, day } = searchParams
	if (dateParam) return dateParam
	if (day) return inferDateFromDay(day)
	return undefined
}
