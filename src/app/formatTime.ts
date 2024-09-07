/**
 * Formats a db sailing time
 * @param timeString: string a sailing time from the db in the format hh:mm:ss, eg: 09:00:00
 * @returns a human readable sailing time, eg: 9:00 AM
 */
export function formatTime(timeString: string) {
	const [hoursString, minutes] = timeString.split(':')

	let hours = Number(hoursString)

	const pm = hours >= 12
	const amPm = pm ? 'PM' : 'AM'

	hours = hours === 0 || hours === 12 ? 12 : pm ? hours - 12 : hours

	return `${hours}:${minutes} ${amPm}`
}
