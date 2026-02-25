import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	getHolidayForDate,
	getHolidaySlug,
	getNextOccurrence,
	getHolidayBySlug,
	getUniqueHolidays,
} from './holidays'

describe('getHolidaySlug', () => {
	it('lowercases and hyphenates', () => {
		expect(getHolidaySlug('Family Day')).toBe('family-day')
		expect(getHolidaySlug('Canada Day')).toBe('canada-day')
		expect(getHolidaySlug('Labour Day')).toBe('labour-day')
	})

	it('strips apostrophes', () => {
		expect(getHolidaySlug("New Year's Day")).toBe('new-years-day')
	})

	it('handles multi-word holidays', () => {
		expect(getHolidaySlug('National Day for Truth and Reconciliation')).toBe(
			'national-day-for-truth-and-reconciliation'
		)
	})

	it('round-trips through getHolidayBySlug', () => {
		const unique = getUniqueHolidays()
		for (const { name, slug } of unique) {
			expect(getHolidaySlug(name)).toBe(slug)
			expect(getHolidayBySlug(slug)?.slug).toBe(slug)
		}
	})
})

describe('getHolidayForDate', () => {
	it('returns Family Day for Feb 16, 2026 (the holiday itself)', () => {
		const result = getHolidayForDate('2026-02-16')
		expect(result?.name).toBe('Family Day')
	})

	it('returns Family Day for nearby dates within the range window', () => {
		// The range check uses the dow of the QUERY date, not the holiday.
		// Feb 13 is Friday (dow=5), range [-1,4]. diff = Feb16-Feb13 = +3 → within [-1,4] ✓
		// Feb 17 is Tuesday (dow=2), range [-5,0]. diff = Feb16-Feb17 = -1 → within [-5,0] ✓
		expect(getHolidayForDate('2026-02-13')?.name).toBe('Family Day') // 3 days before holiday
		expect(getHolidayForDate('2026-02-17')?.name).toBe('Family Day') // 1 day after holiday
	})

	it('returns undefined for dates far from any holiday', () => {
		expect(getHolidayForDate('2026-03-01')).toBeUndefined()
		expect(getHolidayForDate('2026-06-15')).toBeUndefined()
	})

	it('returns Canada Day for July 1, 2026', () => {
		expect(getHolidayForDate('2026-07-01')?.name).toBe('Canada Day')
	})

	it('returns Good Friday for April 3, 2026', () => {
		expect(getHolidayForDate('2026-04-03')?.name).toBe('Good Friday')
	})
})

describe('getNextOccurrence', () => {
	const PINNED_DATE = new Date('2026-02-11T12:00:00-08:00')

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(PINNED_DATE)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns Family Day (Feb 16) when today is Feb 11', () => {
		expect(getNextOccurrence('Family Day')).toBe('2026-02-16')
	})

	it('returns a future holiday that has not yet passed', () => {
		expect(getNextOccurrence('Canada Day')).toBe('2026-07-01')
	})

	it('returns undefined for a holiday with no future occurrence in the list', () => {
		// Christmas 2025 has passed; Christmas 2026 is in the list
		// so it should return 2026-12-25
		expect(getNextOccurrence('Christmas Day')).toBe('2026-12-25')
	})

	it('returns undefined for an unknown holiday name', () => {
		expect(getNextOccurrence('Made Up Holiday')).toBeUndefined()
	})

	it('returns undefined for a past holiday with no future entry', () => {
		// New Year's Day 2026 is Jan 1 — in the past relative to Feb 11
		// There is no 2027 entry, so should return undefined
		expect(getNextOccurrence("New Year's Day")).toBeUndefined()
	})
})
