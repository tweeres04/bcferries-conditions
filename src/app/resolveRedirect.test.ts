import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveRedirect } from './resolveRedirect'

// Pin date to Feb 11, 2026 (Wednesday) so that:
// - next Monday = Feb 16, 2026 = Family Day
// - Family Day is the "next occurrence" of Family Day per the holidays list
const PINNED_DATE = new Date('2026-02-11T12:00:00-08:00') // noon Vancouver time

describe('resolveRedirect', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(PINNED_DATE)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('no redirect cases', () => {
		it('returns null for empty params', () => {
			expect(resolveRedirect({})).toBeNull()
		})

		it('returns null for route + sailing only', () => {
			expect(resolveRedirect({ route: 'TSA-SWB', sailing: '09:00:00' })).toBeNull()
		})

		it('returns null for day param when inferred date is not a holiday', () => {
			// Pinned to Feb 11. Next Friday (Feb 13) is not a holiday
			expect(resolveRedirect({ day: 'friday', route: 'TSA-SWB' })).toBeNull()
		})

		// This is the bug that was fixed: day=monday infers Feb 16 (Family Day),
		// but should NOT redirect since date was not explicitly provided
		it('returns null for day=monday when next Monday is a holiday (regression test)', () => {
			expect(resolveRedirect({ route: 'LNG-HSB', day: 'monday', sailing: '09:00:00' })).toBeNull()
		})

		it('returns null for day=monday with holiday slug already present', () => {
			// If the user somehow got to ?holiday=family-day&day=monday, no redirect loop
			expect(resolveRedirect({ day: 'monday', holiday: 'family-day' })).toBeNull()
		})

		it('returns null for explicit date that is not a holiday', () => {
			expect(resolveRedirect({ date: '2026-03-01' })).toBeNull()
		})

		it('returns null for matching holiday + date that is NOT the next occurrence', () => {
			// Christmas 2025 is in the past relative to our pinned date, so it's not the next occurrence
			expect(
				resolveRedirect({ holiday: 'christmas-day', date: '2025-12-25' })
			).toBeNull()
		})
	})

	describe('strips day when both date and day are provided', () => {
		it('removes day param when date is also present', () => {
			const result = resolveRedirect({ date: '2026-03-01', day: 'monday', route: 'TSA-SWB' })
			expect(result).not.toBeNull()
			const url = new URL(result!, 'https://example.com')
			expect(url.searchParams.get('day')).toBeNull()
			expect(url.searchParams.get('date')).toBe('2026-03-01')
			expect(url.searchParams.get('route')).toBe('TSA-SWB')
		})
	})

	describe('redirects explicit date to holiday slug', () => {
		it('redirects date=2026-02-16 to holiday=family-day', () => {
			const result = resolveRedirect({ date: '2026-02-16', route: 'TSA-SWB' })
			expect(result).not.toBeNull()
			const url = new URL(result!, 'https://example.com')
			expect(url.searchParams.get('holiday')).toBe('family-day')
			expect(url.searchParams.get('date')).toBeNull()
			expect(url.searchParams.get('route')).toBe('TSA-SWB')
		})

		it('preserves sailing param when redirecting to holiday slug', () => {
			const result = resolveRedirect({ date: '2026-02-16', sailing: '09:00:00' })
			expect(result).not.toBeNull()
			const url = new URL(result!, 'https://example.com')
			expect(url.searchParams.get('holiday')).toBe('family-day')
			expect(url.searchParams.get('sailing')).toBe('09:00:00')
		})
	})

	describe('holiday + date mismatch: strips holiday', () => {
		it('removes holiday param when date does not match that holiday', () => {
			// family-day is Feb 16; March 1 is not near any holiday
			const result = resolveRedirect({ holiday: 'family-day', date: '2026-03-01' })
			expect(result).not.toBeNull()
			const url = new URL(result!, 'https://example.com')
			expect(url.searchParams.get('holiday')).toBeNull()
			expect(url.searchParams.get('date')).toBe('2026-03-01')
		})
	})

	describe('holiday + date match next occurrence: strips date', () => {
		it('removes date param when it matches the holiday next occurrence', () => {
			const result = resolveRedirect({ holiday: 'family-day', date: '2026-02-16', route: 'TSA-SWB' })
			expect(result).not.toBeNull()
			const url = new URL(result!, 'https://example.com')
			expect(url.searchParams.get('date')).toBeNull()
			expect(url.searchParams.get('holiday')).toBe('family-day')
			expect(url.searchParams.get('route')).toBe('TSA-SWB')
		})
	})
})
