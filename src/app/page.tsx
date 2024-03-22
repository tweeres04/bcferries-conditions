import { getConditions } from './storeEntries'

export default async function Home() {
	const results = await getConditions()
	return (
		<>
			<h1>bc ferries conditions</h1>
			<pre>{JSON.stringify(results, null, 2)}</pre>
		</>
	)
}
