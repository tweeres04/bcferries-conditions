import { storeEntries } from '@/app/storeEntries'
import { NextResponse } from 'next/server'

export async function POST() {
	try {
		await storeEntries()
	} catch (err) {
		return new NextResponse(err, { status: 500 })
	}

	return new NextResponse(null, { status: 204 })
}
