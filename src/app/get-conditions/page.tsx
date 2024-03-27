import { getConditions } from '../storeEntries'

export default async function GetConditions() {
	const conditions = await getConditions()
	return <pre>{JSON.stringify(conditions, null, 2)}</pre>
}
