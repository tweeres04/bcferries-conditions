import { NextRequest, NextResponse } from 'next/server'

// This route exists to issue a proper 301 redirect from the old /should-i-reserve
// URL to the new homepage (/). We can't use a Next.js page + redirect() here
// because that page was pre-rendered as static HTML (200), meaning the redirect
// never actually fires in the browser or for crawlers. A route handler guarantees
// a real HTTP 301 regardless of rendering mode.
export function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const queryString = searchParams.toString()
	const destination = queryString ? `/?${queryString}` : '/'

	return NextResponse.redirect(new URL(destination, request.url), 301)
}
