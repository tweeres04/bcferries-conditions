'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
	{ href: '/', label: 'Should I Reserve?' },
	{ href: '/busiest-ferry-times', label: 'Busiest Times' },
	{ href: '/history', label: 'History' },
]

export default function Navigation() {
	const pathname = usePathname()

	return (
		<nav className="container mx-auto px-2 py-4">
			<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
				<Link href="/" className="text-2xl font-normal no-underline">
					bc ferries conditions
				</Link>
				<div className="flex gap-4 sm:gap-6 sm:ml-auto">
					{links.map((link) => {
						const isActive =
							link.href === '/'
								? pathname === '/'
								: pathname.startsWith(link.href)
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`text-sm sm:text-base no-underline ${
									isActive
										? 'text-black font-medium'
										: 'text-gray-600 hover:text-black'
								}`}
							>
								{link.label}
							</Link>
						)
					})}
				</div>
			</div>
		</nav>
	)
}
