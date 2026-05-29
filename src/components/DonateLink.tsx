'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/mixpanel'

type Props = {
	// Where this link is rendered, e.g. 'home', 'footer', 'busiest_times'.
	location: string
	className?: string
}

// Outbound "Support the project" link to Stripe. Tracks donation_link_clicked.
// Opens in a new tab, so the current page stays alive long enough to send.
export default function DonateLink({ location, className }: Props) {
	return (
		<div className={cn('text-sm text-gray-600', className)}>
			Finding this useful?{' '}
			<a
				href={process.env.NEXT_PUBLIC_STRIPE_DONATION_URL}
				className="content-link"
				target="_blank"
				rel="noopener"
				onClick={() => trackEvent('donation_link_clicked', { location })}
			>
				Support the project{' '}
				{/* Lucide icons are display: block by default */}
				<Heart size={14} fill="currentColor" className="inline" />
			</a>
		</div>
	)
}
