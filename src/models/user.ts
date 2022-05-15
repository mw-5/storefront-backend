import db from '../database';

/**
 * @description Data of table users.
 */
export type User = {
	id: string;
	first_name: string;
	last_name: string;
	password_digest: string;
};

/**
 * @description Provides methods for interacting with
 * table users of the database.
 */
export class UserStore {}
