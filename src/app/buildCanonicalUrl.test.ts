import { describe, it, expect } from 'vitest'
import { buildCanonicalUrl } from './buildCanonicalUrl'

const BASE_URL = 'https://bcferries-conditions.tweeres.ca'

describe('buildCanonicalUrl', () => {
	describe('base cases', () => {
		it('returns base URL when no params provided', () => {
			expect(buildCanonicalUrl({})).toBe(BASE_URL)
		})

		it('includes route param', () => {
			expect(buildCanonicalUrl({ route: 'TSA-SWB' })).toBe(
				`${BASE_URL}?route=TSA-SWB`
			)
		})

		it('includes route and sailing params', () => {
			const result = buildCanonicalUrl({
				route: 'TSA-SWB',
				sailing: '09:00:00',
			})
			expect(result).toBe(`${BASE_URL}?route=TSA-SWB&sailing=09%3A00%3A00`)
		})
	})

	describe('day of week', () => {
		it('includes day param', () => {
			expect(buildCanonicalUrl({ day: 'friday' })).toBe(`${BASE_URL}?day=friday`)
		})

		it('includes day and explicit dateParam', () => {
			const result = buildCanonicalUrl({
				day: 'friday',
				dateParam: '2026-02-06',
			})
			expect(result).toBe(`${BASE_URL}?day=friday&date=2026-02-06`)
		})

		it('does not include date if dateParam is not provided', () => {
			const result = buildCanonicalUrl({
				day: 'friday',
				date: '2026-02-06', // This should be ignored when dateParam is not set
			})
			expect(result).toBe(`${BASE_URL}?day=friday`)
		})

		it('includes route with day', () => {
			const result = buildCanonicalUrl({
				route: 'TSA-SWB',
				day: 'friday',
			})
			expect(result).toBe(`${BASE_URL}?route=TSA-SWB&day=friday`)
		})
	})

	describe('holidays', () => {
		it('includes holiday param', () => {
			const result = buildCanonicalUrl({
				holidaySlug: 'victoria-day',
				holidayInfo: { name: 'Victoria Day' },
			})
			expect(result).toBe(`${BASE_URL}?holiday=victoria-day`)
		})

		it('excludes date when it matches next occurrence of holiday', () => {
			// Victoria Day 2026 is May 18, 2026
			const result = buildCanonicalUrl({
				holidaySlug: 'victoria-day',
				holidayInfo: { name: 'Victoria Day' },
				date: '2026-05-18',
			})
			// Should NOT include date param since it's the next occurrence
			expect(result).toBe(`${BASE_URL}?holiday=victoria-day`)
		})

		it('includes date when it does not match next occurrence of holiday', () => {
			// Different date than next occurrence
			const result = buildCanonicalUrl({
				holidaySlug: 'victoria-day',
				holidayInfo: { name: 'Victoria Day' },
				date: '2027-05-24',
			})
			// Should include date param since it's not the next occurrence
			expect(result).toBe(`${BASE_URL}?holiday=victoria-day&date=2027-05-24`)
		})

		it('includes route with holiday', () => {
			const result = buildCanonicalUrl({
				route: 'SWB-TSA',
				holidaySlug: 'canada-day',
				holidayInfo: { name: 'Canada Day' },
			})
			expect(result).toBe(`${BASE_URL}?route=SWB-TSA&holiday=canada-day`)
		})

		it('does not include holiday if holidayInfo is missing', () => {
			const result = buildCanonicalUrl({
				holidaySlug: 'victoria-day',
				// holidayInfo is undefined
			})
			// Should fall through to empty base URL
			expect(result).toBe(BASE_URL)
		})
	})

	describe('date only', () => {
		it('includes date param when no day or holiday', () => {
			expect(buildCanonicalUrl({ date: '2026-03-15' })).toBe(
				`${BASE_URL}?date=2026-03-15`
			)
		})

		it('includes route with date', () => {
			const result = buildCanonicalUrl({
				route: 'TSA-SWB',
				date: '2026-03-15',
			})
			expect(result).toBe(`${BASE_URL}?route=TSA-SWB&date=2026-03-15`)
		})
	})

	describe('priority order', () => {
		it('prioritizes holiday over day', () => {
			const result = buildCanonicalUrl({
				holidaySlug: 'victoria-day',
				holidayInfo: { name: 'Victoria Day' },
				day: 'friday',
			})
			// Should use holiday, not day
			expect(result).toBe(`${BASE_URL}?holiday=victoria-day`)
		})

		it('prioritizes day over standalone date', () => {
			const result = buildCanonicalUrl({
				day: 'sunday',
				date: '2026-03-15',
			})
			// Should use day, date is ignored without dateParam
			expect(result).toBe(`${BASE_URL}?day=sunday`)
		})
	})

	describe('complex combinations', () => {
		it('handles route, sailing, and day', () => {
			const result = buildCanonicalUrl({
				route: 'SWB-TSA',
				sailing: '11:00:00',
				day: 'saturday',
			})
			expect(result).toBe(
				`${BASE_URL}?route=SWB-TSA&sailing=11%3A00%3A00&day=saturday`
			)
		})

		it('handles route, sailing, and holiday', () => {
			const result = buildCanonicalUrl({
				route: 'TSA-SWB',
				sailing: '15:00:00',
				holidaySlug: 'labour-day',
				holidayInfo: { name: 'Labour Day' },
			})
			expect(result).toBe(
				`${BASE_URL}?route=TSA-SWB&sailing=15%3A00%3A00&holiday=labour-day`
			)
		})
	})
})
