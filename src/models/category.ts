import db from '../database';

/**
 * @description Data of table categories
 */
export type Category = {
	id?: string;
	name: string;
};

/**
 * @description Provides CRUD methods for table
 * categories of the database.
 */
export class CategoryStore {
	/**
	 * @description Create provided category in the database.
	 * @param c - The category that should be created
	 * @returns - The new category
	 */
	async create(c: Category): Promise<Category> {
		try {
			const sql =
				'INSERT INTO categories (name)' + ' VALUES ($1) RETURNING *;';
			const conn = await db.connect();
			const result = await conn.query(sql, [c.name]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Unable to create category ${c}.\n${err}`);
		}
	}
}
