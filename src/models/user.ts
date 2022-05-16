import db from '../database';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

/**
 * @description Data of table users.
 */
export type User = {
	id: string;
	// Underscore is used here instead of camel case
	// in order for properties to match column names
	first_name: string;
	last_name: string;
	password: string;
	password_digest: string;
};

dotenv.config();

const SALT_ROUNDS = process.env.SALT_ROUNDS as string;
const PEPPER = process.env.BCRYPT_PASSWORD as string;

/**
 * @description Provides methods for interacting with
 * table users of the database.
 */
export class UserStore {
	/**
	 * @description Create a new user in the database.
	 * @param u - The user to be created
	 * @returns - The created user
	 */
	async create(u: User): Promise<User> {
		try {
			const hashedPassword = bcrypt.hashSync(
				u.password + PEPPER,
				parseInt(SALT_ROUNDS)
			);
			const sql =
				'INSERT INTO users (id, first_name, last_name, password_digest)' +
				' VALUES ($1, $2, $3, $4) RETURNING *;';
			const conn = await db.connect();
			const result = await conn.query(sql, [
				u.id,
				u.first_name,
				u.last_name,
				hashedPassword,
			]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Unable to create user ${u.id}.\n${err}`);
		}
	}

	/**
	 * @description - Authenticate user.
	 * @param id - The user id
	 * @param password - The password used for authentication
	 * @returns - The user if authenticated successfully, otherwise null
	 */
	async authenticate(id: string, password: string): Promise<User | null> {
		try {
			// Get user
			const sql = 'SELECT * FROM users WHERE id = $1;';
			const conn = await db.connect();
			const result = await conn.query(sql, [id]);
			conn.release();

			// Check whether user exists to avoid that
			// user has confused sign on and sign in
			if (result.rowCount > 0) {
				const user = result.rows[0];
				// Check password
				if (
					bcrypt.compareSync(password + PEPPER, user.password_digest)
				) {
					return user;
				}
			}
			return null;
		} catch (err) {
			throw new Error(`Unable to authenticate user ${id}.\n${err}`);
		}
	}
}
