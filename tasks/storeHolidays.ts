const exampleHoliday = {
	id: 28,
	date: '2025-09-30',
	nameEn: 'National Day for Truth and Reconciliation',
	nameFr: 'Journée nationale de la vérité et de la réconciliation',
	federal: 1,
	observedDate: '2025-09-30',
}

const allHolidays = (
	await Promise.all([
		fetch('https://canada-holidays.ca/api/v1/provinces/BC?year=2024').then(
			(response) => response.json()
		),
		fetch('https://canada-holidays.ca/api/v1/provinces/BC?year=2025').then(
			(response) => response.json()
		),
	])
)
	.flatMap((r) => r.province.holidays)
	.map(({ date, nameEn: name, observedDate }) => ({ date, name, observedDate }))

console.log(allHolidays)
