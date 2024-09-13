import type { Config } from 'drizzle-kit'

const productionDb = {
	host: process.env.PGHOST as string,
	database: process.env.PGDATABASE as string,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	ssl: true,
}
const devDb = {
	host: 'localhost',
	database: 'postgres',
	password: 'bcferries',
	port: 5433,
}

export default {
	schema: './src/schema.ts',
	driver: 'pg',
	dbCredentials: productionDb,
	out: './drizzle',
} satisfies Config
