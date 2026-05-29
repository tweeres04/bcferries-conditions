'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/mixpanel'

type Props = {
	event: 'daily_summary_viewed' | 'sailing_forecast_viewed'
	properties: Record<string, string | number | boolean>
}

// Fires a value-moment event when the should-i-reserve result renders.
// Keyed on a signature so it re-fires after each server-action navigation
// (selecting a new route/date/sailing re-renders this with new props).
export default function TrackReserveView({ event, properties }: Props) {
	const signature = `${event}:${JSON.stringify(properties)}`

	useEffect(() => {
		trackEvent(event, properties)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [signature])

	return null
}
