import { redirect } from 'next/navigation'

type Props = {
	searchParams: Record<string, string | string[] | undefined>
}

export default function ShouldIReserveRedirect({ searchParams }: Props) {
	const params = new URLSearchParams()

	// Preserve all query parameters
	Object.entries(searchParams).forEach(([key, value]) => {
		if (value) {
			if (Array.isArray(value)) {
				value.forEach((v) => params.append(key, v))
			} else {
				params.set(key, value)
			}
		}
	})

	const queryString = params.toString()
	redirect(`/${queryString ? `?${queryString}` : ''}`)
}
