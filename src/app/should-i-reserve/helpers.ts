import { formatISO, nextDay, Day } from 'date-fns'
import { TZDate } from '@date-fns/tz'

const dayOfWeekMap: Record<string, Day> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
}

export function inferDateFromDay(day: string): string | undefined {
	const dowValue = dayOfWeekMap[day.toLowerCase()]
	if (dowValue === undefined) return undefined

	return formatISO(nextDay(TZDate.tz('America/Vancouver'), dowValue), {
		representation: 'date',
	})
}

export function capitalizeDay(day: string): string {
	return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
}
