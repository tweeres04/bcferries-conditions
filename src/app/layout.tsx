import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const title = 'BC Ferries Conditions Analytics - Plan your trip stress-free'
const description =
	"Historical data and analytics tools for BC Ferries' vehicle deck space capacity."

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		images: 'https://bcferries-conditions.tweeres.ca/og-image.jpg',
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
