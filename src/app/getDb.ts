import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/schema'

const queryClient = postgres({
	host: process.env.PGHOST as string,
	database: process.env.PGDATABASE as string,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
	ssl: process.env.PGSSL === 'false' ? false : true,
})

export function getDB() {
	return drizzle(queryClient, { schema, logger: true })
}
