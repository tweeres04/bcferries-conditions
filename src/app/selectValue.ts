import { redirect, RedirectType } from 'next/navigation'

export function selectValue(baseUrl: string, key: string) {
	return async function (
		existingSearchParams: [string, string][],
		newValue: string
	) {
		'use server'

		const newSearchParams = {
			...existingSearchParams.reduce(
				(result, [k, v]) => ({ ...result, [k]: v }),
				{}
			),
			[key]: newValue,
		}

		const newUrl = newSearchParams
			? `${baseUrl}?${new URLSearchParams(newSearchParams)}`
			: '${baseUrl}'

		redirect(newUrl, RedirectType.replace)
	}
}
