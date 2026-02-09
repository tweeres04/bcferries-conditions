import { Poppins } from 'next/font/google'
import Script from 'next/script'
import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import './globals.css'

const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
	metadataBase: new URL('https://bcferries-conditions.tweeres.ca'),
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={poppins.className}>
				<Script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-F7KKD021M0"
				></Script>
				{process.env.NODE_ENV === 'production' ? (
					<script
						dangerouslySetInnerHTML={{
							__html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F7KKD021M0');`,
						}}
					></script>
				) : null}
				<Navigation />
				{children}
				<script
					async
					src="https://scripts.simpleanalyticscdn.com/latest.js"
				></script>
			</body>
		</html>
	)
}
