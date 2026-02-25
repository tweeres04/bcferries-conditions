import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { inferDateFromDay } from './helpers'

// Pin to Wednesday Feb 11, 2026
const PINNED_DATE = new Date('2026-02-11T12:00:00-08:00')

describe('inferDateFromDay', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(PINNED_DATE)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns next Monday from a Wednesday', () => {
		expect(inferDateFromDay('monday')).toBe('2026-02-16')
	})

	it('returns next Friday from a Wednesday', () => {
		expect(inferDateFromDay('friday')).toBe('2026-02-13')
	})

	it('returns next Wednesday from a Wednesday (next week, not today)', () => {
		expect(inferDateFromDay('wednesday')).toBe('2026-02-18')
	})

	it('returns next Sunday from a Wednesday', () => {
		expect(inferDateFromDay('sunday')).toBe('2026-02-15')
	})

	it('is case-insensitive', () => {
		expect(inferDateFromDay('Monday')).toBe('2026-02-16')
		expect(inferDateFromDay('FRIDAY')).toBe('2026-02-13')
	})

	it('returns undefined for an invalid day name', () => {
		expect(inferDateFromDay('funday')).toBeUndefined()
		expect(inferDateFromDay('')).toBeUndefined()
	})
})
