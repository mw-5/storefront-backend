import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
	POSTGRES_HOST,
	POSTGRES_DB,
	POSTGRES_DB_TEST,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	ENV,
} = process.env;

let database: Pool;

if (ENV === 'prod' || ENV === 'dev') {
	database = new Pool({
		host: POSTGRES_HOST,
		database: POSTGRES_DB,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
	});
} else if (ENV === 'test') {
	database = new Pool({
		host: POSTGRES_HOST,
		database: POSTGRES_DB_TEST,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
	});
} else {
	const errMsg =
		'Missing environment variables for PostgreSQL.' +
		'\nPlease check .env for existence of these variables:' +
		'\nENV = <prod | dev | test>\nPOSTGRES_HOST' +
		'\nPOSTGRES_DB | POSTGRES_DB_TEST' +
		'\nPOSTGRES_USER\nPOSTGRES_PASSWORD';
	throw new Error(errMsg);
}

export default database;
