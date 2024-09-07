import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const title =
	'BC Ferries Conditions Analytics - Plan your ferry ride stress-free'
const description =
	"Historical data and analytics tools for BC Ferries' vehicle deck space capacity."
const url = 'https://bcferries-conditions.tweeres.ca'

export const metadata: Metadata = {
	title,
	description,
	alternates: {
		canonical: url,
	},
	openGraph: {
		title,
		description,
		url,
		type: 'website',
		images: 'https://bcferries-conditions.tweeres.ca/og.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	)
}
