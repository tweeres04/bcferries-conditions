/**
 * Generates Google Search Console inspection URLs using the URL Inspection API
 *
 * Prerequisites:
 *   - Run: gcloud auth application-default login
 *   - Select the Google account that has access to Search Console
 *
 * Usage: npx tsx scripts/gsc-inspect-urls.ts
 *
 * Options:
 *   --filter <pattern>  Only show URLs containing this pattern (e.g., --filter "day=friday")
 *   --limit <n>         Limit output to n URLs
 *   --concurrency <n>   Number of concurrent API requests (default: 10)
 */

import { google } from 'googleapis'
import pLimit from 'p-limit'

const SITE_URL = 'https://bcferries-conditions.tweeres.ca/'
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

async function fetchSitemap(): Promise<string[]> {
	const response = await fetch(SITEMAP_URL)
	const xml = await response.text()

	const urls: string[] = []
	const locRegex = /<loc>([^<]+)<\/loc>/g
	let match

	while ((match = locRegex.exec(xml)) !== null) {
		const url = match[1].replace(/&amp;/g, '&')
		urls.push(url)
	}

	return urls
}

async function getInspectionLink(
	inspectionUrl: string,
): Promise<string | null> {
	try {
		const auth = new google.auth.GoogleAuth({
			scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
		})

		const authClient = await auth.getClient()
		const searchconsole = google.searchconsole({
			version: 'v1',
			auth: authClient as any,
		})

		const response = await searchconsole.urlInspection.index.inspect({
			requestBody: {
				inspectionUrl,
				siteUrl: SITE_URL,
			},
		})

		return response.data.inspectionResult?.inspectionResultLink || null
	} catch (error: any) {
		console.error(`Error inspecting ${inspectionUrl}:`, error.message)
		return null
	}
}

async function main() {
	const args = process.argv.slice(2)
	const filterIndex = args.indexOf('--filter')
	const limitIndex = args.indexOf('--limit')
	const concurrencyIndex = args.indexOf('--concurrency')

	const filter = filterIndex !== -1 ? args[filterIndex + 1] : null
	const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null
	const concurrency =
		concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1], 10) : 10

	console.log('Fetching sitemap...\n')
	let urls = await fetchSitemap()

	if (filter) {
		urls = urls.filter((url) => url.includes(filter))
		console.log(`Filtered to URLs containing "${filter}"\n`)
	}

	if (limit) {
		urls = urls.slice(0, limit)
		console.log(`Limited to ${limit} URLs\n`)
	}

	console.log(`Found ${urls.length} URLs`)
	console.log(`Fetching inspection links (${concurrency} at a time)...\n`)
	console.log('='.repeat(80))

	const limiter = pLimit(concurrency)
	const results: Array<{ url: string; link: string | null }> = []

	const tasks = urls.map((url) =>
		limiter(async () => {
			const link = await getInspectionLink(url)
			results.push({ url, link })
			process.stdout.write('.')
			return { url, link }
		}),
	)

	await Promise.all(tasks)

	console.log('\n')
	console.log('='.repeat(80))
	console.log('\nResults:\n')

	for (const { url, link } of results) {
		console.log(`Page: ${url}`)
		if (link) {
			console.log(`GSC:  ${link}`)
		} else {
			console.log(`GSC:  (Unable to get inspection link)`)
		}
		console.log('')
	}

	console.log('='.repeat(80))
	console.log(`\nTotal: ${urls.length} URLs`)
}

main().catch((error) => {
	console.error('Fatal error:', error.message)
	if (error.message.includes('Could not load the default credentials')) {
		console.error('\nPlease run: gcloud auth application-default login')
	}
	process.exit(1)
})
