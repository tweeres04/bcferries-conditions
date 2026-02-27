import { storeEntries } from '@/app/storeEntries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const apiKey = process.env.CRON_API_KEY
	if (apiKey) {
		const authHeader = request.headers.get('authorization')
		if (authHeader !== `Bearer ${apiKey}`) {
			return new NextResponse(null, { status: 401 })
		}
	}

	try {
		await storeEntries()
	} catch (err) {
		return new NextResponse(String(err), { status: 500 })
	}

	return new NextResponse(null, { status: 204 })
}
