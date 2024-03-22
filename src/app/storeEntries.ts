import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import scrapeIt from 'scrape-it'
import { addDays, formatISO } from 'date-fns'

import * as schema from '@/schema'

const queryClient = postgres({
	host: process.env.PGHOST as string,
	database: process.env.PGDATABASE as string,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	ssl: true,
})
const db = drizzle(queryClient, { schema, logger: true })

type ConditionsResult = {
	time: string | null
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

	let { data } = await scrapeIt<{ entries: ConditionsResult[] }>(
		'https://www.bcferries.com/current-conditions/SWB-TSA',
		{
			entries: {
				listItem: 'tr.mobile-friendly-row',
				data: {
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
	)
	let data_ = data.entries.map(emptyStringsToNull)
	return data_
}

export async function storeEntries() {
	const entries = await getConditions()

	await Promise.all(
		entries.map((e) => {
			const date = formatISO(
				e.isTomorrow ? addDays(new Date(), 1) : new Date(),
				{ representation: 'date' }
			)
			const full = e.fullMessage?.toLowerCase() === 'full' ? true : false
			return db.insert(schema.entries).values({
				date,
				time: e.time,
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
