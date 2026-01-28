import { Skeleton } from '@/components/ui/skeleton'

export default function ChartSkeleton() {
	return (
		<Skeleton
			style={{ height: 'calc(50dvh - 32px - 50px - 5px)' }}
			className="w-full"
		/>
	)
}
