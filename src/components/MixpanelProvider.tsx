'use client'

import { useEffect } from 'react'
import { initMixpanel } from '@/lib/mixpanel'

// Initializes Mixpanel once on the client. Rendered from the root layout.
export default function MixpanelProvider() {
	useEffect(() => {
		initMixpanel()
	}, [])

	return null
}
