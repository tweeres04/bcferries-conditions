import mixpanel from 'mixpanel-browser'

// Public, client-side Mixpanel project token. Safe to expose to the browser.
const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

let initialized = false

// Initialize Mixpanel once at app startup. Safe to call multiple times.
// No identity calls: this is an anonymous public site with no user accounts,
// so Mixpanel's auto-generated device ID is the distinct_id.
export function initMixpanel() {
	if (initialized || !token || typeof window === 'undefined') return

	mixpanel.init(token, {
		debug: process.env.NODE_ENV !== 'production',
		// Path-only pageviews. The should-i-reserve form encodes its steps in
		// the query string, so 'url-with-path' avoids firing a pageview per step.
		track_pageview: 'url-with-path',
		// Avoid third-party cookies; keep our footprint to localStorage.
		persistence: 'localStorage',
		// Autocapture powers heatmaps (clicks) and captures inputs/scroll/submit.
		// Pageviews are handled by track_pageview above, so disable them here to
		// avoid double-counting.
		autocapture: {
			pageview: false,
			click: true,
			input: true,
			scroll: true,
			submit: true,
		},
		// Session Replay: record every session (low traffic; dial down later).
		record_sessions_percent: 100,
		// Don't obfuscate recordings — show real text and input values...
		record_mask_all_text: false,
		record_mask_all_inputs: false,
		// ...except the feedback email field, which is PII we shouldn't store.
		record_mask_input_selector: 'input[type="email"]',
	})

	initialized = true
}

type EventProperties = Record<string, string | number | boolean>

// Track an event. No-ops when the token is missing or we're not in the browser.
export function trackEvent(event: string, properties?: EventProperties) {
	if (!token || typeof window === 'undefined') return
	if (!initialized) initMixpanel()
	mixpanel.track(event, properties)
}
