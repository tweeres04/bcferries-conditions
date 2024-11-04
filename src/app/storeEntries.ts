import scrapeIt from 'scrape-it'
import { addDays, formatISO, subHours } from 'date-fns'

import * as schema from '@/schema'
import { getDb } from './getDb'

type ConditionsResult = {
	time: string | null
	route: string
	vessel: string | null
	overallPercent: string | null
	vehiclePercent: string | null
	truckPercent: string | null
	fullMessage: string | null
	eta: string | null
	departure: string | null
	isTomorrow: string | null
}

type ConditionsResultKey = keyof ConditionsResult

function processPercent(s: string) {
	s = s.replace('%', '')
	s = s.toLowerCase() === 'full' ? '0' : s
	return s
}

function emptyStringsToNull(record: ConditionsResult) {
	const newRecord: ConditionsResult = { ...record }
	for (const prop in newRecord) {
		if (newRecord[prop as ConditionsResultKey] === '') {
			newRecord[prop as ConditionsResultKey] = null
		}
	}
	return newRecord
}

export async function getConditions() {
	'use server'

	const routes = ['SWB-TSA', 'TSA-SWB']

	const data = await Promise.all(
		routes.flatMap((route) =>
			scrapeIt<{ entries: ConditionsResult[] }>(
				`https://www.bcferries.com/current-conditions/${route}`,
				{
					entries: {
						listItem: 'tr.mobile-friendly-row',
						data: {
							route: {
								convert: () => route,
							},
							time: '.mobile-paragraph .text-lowercase',
							vessel: '.mobile-paragraph a.sailing-ferry-name',
							overallPercent: {
								selector: '.cc-vessel-percent-full',
								convert: processPercent,
							},
							vehiclePercent: {
								selector: '.vehicle-info-link .pcnt:nth-of-type(2)',
								convert: processPercent,
							},
							truckPercent: {
								selector: '.vehicle-info-link .pcnt:nth-of-type(4)',
								convert: processPercent,
							},
							fullMessage: {
								selector: '.percentage-full .font-size-22',
							},
							eta: {
								selector: '.cc-message-updates',
								convert: (m: string) =>
									m.includes('ETA') ? m.replace(/ETA\n +:\n +/, '') : '',
							},
							departure: {
								selector: '.mobile-paragraph .font-italic',
								convert: (d) => d.replace(/Departed\s\n\s+/, ''),
							},
							isTomorrow: {
								selector: '.next-day-sailing',
								convert: (t: string) => (t.includes('Tomorrow') ? true : false),
							},
						},
					},
				}
			).then(({ data }) => data.entries)
		)
	)

	let data_ = data.flatMap((d) => d).map(emptyStringsToNull)

	return data_
}

export async function storeEntries() {
	const entries = await getConditions()
	const db = getDb()

	await Promise.all(
		entries.map((e) => {
			const todayInBc = subHours(new Date(), 8) // Need to adjust this when DST ends
			const date = formatISO(e.isTomorrow ? addDays(todayInBc, 1) : todayInBc, {
				representation: 'date',
			})
			const full = e.fullMessage?.toLowerCase() === 'full' ? true : false
			return db.insert(schema.entries).values({
				date,
				time: e.time,
				route: e.route,
				vessel: e.vessel,
				overallPercent: full ? '0' : e.overallPercent,
				vehiclePercent: full ? '0' : e.vehiclePercent,
				truckPercent: full ? '0' : e.truckPercent,
				full,
				eta: e.eta,
				departure: e.departure,
			})
		})
	)
}
