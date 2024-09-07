import { differenceInCalendarDays, getDay } from 'date-fns'

const holidays = [
	{
		date: '2024-01-01',
		name: 'New Year’s Day',
		observedDate: '2024-01-01',
	},
	{
		date: '2024-02-19',
		name: 'Family Day',
		observedDate: '2024-02-19',
	},
	{
		date: '2024-03-29',
		name: 'Good Friday',
		observedDate: '2024-03-29',
	},
	{
		date: '2024-05-20',
		name: 'Victoria Day',
		observedDate: '2024-05-20',
	},
	{
		date: '2024-07-01',
		name: 'Canada Day',
		observedDate: '2024-07-01',
	},
	{
		date: '2024-08-05',
		name: 'British Columbia Day',
		observedDate: '2024-08-05',
	},
	{
		date: '2024-09-02',
		name: 'Labour Day',
		observedDate: '2024-09-02',
	},
	{
		date: '2024-09-30',
		name: 'National Day for Truth and Reconciliation',
		observedDate: '2024-09-30',
	},
	{
		date: '2024-10-14',
		name: 'Thanksgiving',
		observedDate: '2024-10-14',
	},
	{
		date: '2024-11-11',
		name: 'Remembrance Day',
		observedDate: '2024-11-11',
	},
	{
		date: '2024-12-25',
		name: 'Christmas Day',
		observedDate: '2024-12-25',
	},
	{
		date: '2025-01-01',
		name: 'New Year’s Day',
		observedDate: '2025-01-01',
	},
	{
		date: '2025-02-17',
		name: 'Family Day',
		observedDate: '2025-02-17',
	},
	{
		date: '2025-04-18',
		name: 'Good Friday',
		observedDate: '2025-04-18',
	},
	{
		date: '2025-05-19',
		name: 'Victoria Day',
		observedDate: '2025-05-19',
	},
	{
		date: '2025-07-01',
		name: 'Canada Day',
		observedDate: '2025-07-01',
	},
	{
		date: '2025-08-04',
		name: 'British Columbia Day',
		observedDate: '2025-08-04',
	},
	{
		date: '2025-09-01',
		name: 'Labour Day',
		observedDate: '2025-09-01',
	},
	{
		date: '2025-09-30',
		name: 'National Day for Truth and Reconciliation',
		observedDate: '2025-09-30',
	},
	{
		date: '2025-10-13',
		name: 'Thanksgiving',
		observedDate: '2025-10-13',
	},
	{
		date: '2025-11-11',
		name: 'Remembrance Day',
		observedDate: '2025-11-11',
	},
	{
		date: '2025-12-25',
		name: 'Christmas Day',
		observedDate: '2025-12-25',
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

export function getHolidayForDate(date: string) {
	const dow = getDay(date) as keyof typeof ranges
	const holiday = holidays.find((h) => {
		const diff = differenceInCalendarDays(h.observedDate, date)
		return diff >= ranges[dow][0] && diff <= ranges[dow][1]
	})
	return holiday
}
