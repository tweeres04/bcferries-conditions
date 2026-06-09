import { differenceInCalendarDays, getDay, formatISO } from 'date-fns'
import { TZDate, tz } from '@date-fns/tz'

export const holidays = [
	{
		date: '2025-12-25',
		name: 'Christmas Day',
		observedDate: '2025-12-25',
	},
	{
		date: '2026-01-01',
		name: 'New Year’s Day',
		observedDate: '2026-01-01',
	},
	{
		date: '2026-02-16',
		name: 'Family Day',
		observedDate: '2026-02-16',
	},
	{
		date: '2026-04-03',
		name: 'Good Friday',
		observedDate: '2026-04-03',
	},
	{
		date: '2026-05-18',
		name: 'Victoria Day',
		observedDate: '2026-05-18',
	},
	{
		date: '2026-07-01',
		name: 'Canada Day',
		observedDate: '2026-07-01',
	},
	{
		date: '2026-08-03',
		name: 'British Columbia Day',
		observedDate: '2026-08-03',
	},
	{
		date: '2026-09-07',
		name: 'Labour Day',
		observedDate: '2026-09-07',
	},
	{
		date: '2026-09-30',
		name: 'National Day for Truth and Reconciliation',
		observedDate: '2026-09-30',
	},
	{
		date: '2026-10-12',
		name: 'Thanksgiving',
		observedDate: '2026-10-12',
	},
	{
		date: '2026-11-11',
		name: 'Remembrance Day',
		observedDate: '2026-11-11',
	},
	{
		date: '2026-12-25',
		name: 'Christmas Day',
		observedDate: '2026-12-25',
	},
]

const ranges = {
	0: [-3, 2],
	1: [-4, 1],
	2: [-5, 0],
	3: [0, 0],
	4: [0, 5],
	5: [-1, 4],
	6: [-2, 3],
}

export function getHolidaySlug(name: string) {
	return name
		.toLowerCase()
		.replace(/[’']/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

export function getUniqueHolidays() {
	const uniqueNames = Array.from(new Set(holidays.map((h) => h.name)))
	return uniqueNames.map((name) => ({
		name,
		slug: getHolidaySlug(name),
	}))
}

export function getHolidayBySlug(slug: string) {
	return getUniqueHolidays().find((h) => h.slug === slug)
}

export function getNextOccurrence(name: string) {
	const today = formatISO(TZDate.tz('America/Vancouver'), { representation: 'date' })
	const next = holidays
		.filter((h) => h.name === name)
		.find((h) => h.observedDate >= today)
	return next?.observedDate
}

/**
 * Returns the holiday a request should be treated as, or undefined if it shouldn't
 * be treated as a holiday page. A holiday slug only "sticks" when the effective date
 * actually falls within that holiday's window — otherwise (e.g. ?holiday=family-day&day=monday
 * where that Monday isn't Family Day) we drop the holiday so the canonical URL doesn't
 * funnel authority into a stale dated URL. With no date, the slug is taken at face value.
 */
export function getEffectiveHoliday(
	holidaySlug: string | undefined,
	date: string | undefined
) {
	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined
	if (!holidayInfo || !date) return holidayInfo
	const matches = getHolidaySlug(getHolidayForDate(date)?.name ?? '') === holidaySlug
	return matches ? holidayInfo : undefined
}

export function getHolidayForDate(date: string) {
	const dow = getDay(date, { in: tz('America/Vancouver') }) as keyof typeof ranges
	const holiday = holidays.find((h) => {
		const diff = differenceInCalendarDays(h.observedDate, date)
		return diff >= ranges[dow][0] && diff <= ranges[dow][1]
	})
	return holiday
}
