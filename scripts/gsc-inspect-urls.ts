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
 *   --filter <pattern>    Only show URLs containing this pattern (e.g., --filter "day=friday")
 *   --status <verdict>    Filter by verdict: PASS, NEUTRAL, FAIL, or ERROR
 *   --limit <n>           Limit output to n URLs
 *   --concurrency <n>     Number of concurrent API requests (default: 10)
 *   --csv                 Output as CSV format
 */

import { google } from 'googleapis'
import pLimit from 'p-limit'

const SITE_URL = 'https://bcferries-conditions.tweeres.ca/'
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`
const TIMEZONE = 'America/Vancouver'

type InspectionResult = {
	url: string
	link: string | null
	verdict: string | null // PASS, NEUTRAL, FAIL
	coverageState: string | null // Human-readable status
	lastCrawlTime: string | null // RFC3339 timestamp
	error: string | null // Error message if API call failed
}

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

function formatDateInTimezone(isoString: string | null | undefined): string {
	if (!isoString) return '-'
	try {
		const date = new Date(isoString)
		return date.toLocaleString('en-US', {
			timeZone: TIMEZONE,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		})
	} catch {
		return isoString
	}
}

async function getInspectionResult(
	inspectionUrl: string,
): Promise<InspectionResult> {
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

		const result = response.data.inspectionResult
		const indexStatus = result?.indexStatusResult

		return {
			url: inspectionUrl,
			link: result?.inspectionResultLink || null,
			verdict: indexStatus?.verdict || null,
			coverageState: indexStatus?.coverageState || null,
			lastCrawlTime: indexStatus?.lastCrawlTime || null,
			error: null,
		}
	} catch (error: any) {
		return {
			url: inspectionUrl,
			link: null,
			verdict: 'ERROR',
			coverageState: null,
			lastCrawlTime: null,
			error: error.message,
		}
	}
}

function printTable(results: InspectionResult[]) {
	// Column widths
	const verdictWidth = 8
	const coverageWidth = 50
	const crawlWidth = 20
	const urlWidth = 60

	// Header
	console.log(
		[
			'Verdict'.padEnd(verdictWidth),
			'Coverage State'.padEnd(coverageWidth),
			'Last Crawl'.padEnd(crawlWidth),
			'URL'.padEnd(urlWidth),
			'GSC Link',
		].join(' | '),
	)
	console.log(
		[
			'-'.repeat(verdictWidth),
			'-'.repeat(coverageWidth),
			'-'.repeat(crawlWidth),
			'-'.repeat(urlWidth),
			'-'.repeat(50),
		].join('-|-'),
	)

	// Rows
	for (const result of results) {
		const verdict = (result.verdict || 'ERROR').padEnd(verdictWidth)
		const coverage = (result.error || result.coverageState || '-').padEnd(
			coverageWidth,
		)
		const crawl = formatDateInTimezone(result.lastCrawlTime).padEnd(crawlWidth)
		const url = result.url.padEnd(urlWidth)
		const link = result.link || '-'

		console.log([verdict, coverage, crawl, url, link].join(' | '))
	}
}

function printCsv(results: InspectionResult[]) {
	// Header
	console.log('verdict,coverageState,lastCrawlTime,url,gscLink,error')

	// Rows
	for (const result of results) {
		const row = [
			result.verdict || 'ERROR',
			result.coverageState || '',
			result.lastCrawlTime || '',
			result.url,
			result.link || '',
			result.error || '',
		]
		// Escape quotes and wrap in quotes if needed
		const escaped = row.map((field) => {
			if (field.includes(',') || field.includes('"') || field.includes('\n')) {
				return `"${field.replace(/"/g, '""')}"`
			}
			return field
		})
		console.log(escaped.join(','))
	}
}

function printSummary(results: InspectionResult[]) {
	const counts = {
		PASS: 0,
		NEUTRAL: 0,
		FAIL: 0,
		ERROR: 0,
	}

	for (const result of results) {
		const verdict = result.verdict || 'ERROR'
		if (verdict in counts) {
			counts[verdict as keyof typeof counts]++
		}
	}

	console.log('='.repeat(80))
	console.log('Summary:')
	console.log(`  PASS (Indexed):      ${counts.PASS}`)
	console.log(`  NEUTRAL (Excluded):  ${counts.NEUTRAL}`)
	console.log(`  FAIL (Error):        ${counts.FAIL}`)
	console.log(`  API Errors:          ${counts.ERROR}`)
	console.log(`  Total:               ${results.length}`)
	console.log('='.repeat(80))
}

async function main() {
	const args = process.argv.slice(2)
	const filterIndex = args.indexOf('--filter')
	const statusIndex = args.indexOf('--status')
	const limitIndex = args.indexOf('--limit')
	const concurrencyIndex = args.indexOf('--concurrency')
	const csvFlag = args.includes('--csv')

	const filter = filterIndex !== -1 ? args[filterIndex + 1] : null
	const statusFilter = statusIndex !== -1 ? args[statusIndex + 1] : null
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
	console.log(`Fetching inspection data (${concurrency} at a time)...\n`)
	console.log('='.repeat(80))

	const limiter = pLimit(concurrency)
	const results: InspectionResult[] = []

	const tasks = urls.map((url) =>
		limiter(async () => {
			const result = await getInspectionResult(url)
			results.push(result)
			process.stdout.write('.')
			return result
		}),
	)

	await Promise.all(tasks)

	console.log('\n')
	console.log('='.repeat(80))
	console.log('\n')

	// Filter by status if requested
	let filteredResults = results
	if (statusFilter) {
		const upperStatus = statusFilter.toUpperCase()
		filteredResults = results.filter((r) => r.verdict === upperStatus)
		console.log(
			`Showing only ${upperStatus} results (${filteredResults.length} of ${results.length})\n`,
		)
	}

	// Output results
	if (csvFlag) {
		printCsv(filteredResults)
	} else {
		printTable(filteredResults)
	}

	console.log('\n')
	printSummary(results)
}

main().catch((error) => {
	console.error('Fatal error:', error.message)
	if (error.message.includes('Could not load the default credentials')) {
		console.error('\nPlease run: gcloud auth application-default login')
	}
	process.exit(1)
})
