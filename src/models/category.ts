import db from '../database';

/**
 * @description Data of table categories
 */
export type Category = {
	id?: string;
	name: string;
};

/**
 * @description Provides methods for interacting with
 * table categories of the database.
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

	/**
	 * @description List all categories from the database.
	 * @returns - The list of categories
	 */
	async index(): Promise<Category[]> {
		try {
			const sql = 'SELECT * FROM categories;';
			const conn = await db.connect();
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Unable to get categories.\n${err}`);
		}
	}

	/**
	 * @description Get category for given id.
	 * @param id - The id of the category
	 * @returns - The category
	 */
	async show(id: string): Promise<Category> {
		try {
			const sql = 'SELECT * FROM  categories WHERE id = $1;';
			const conn = await db.connect();
			const result = await conn.query(sql, [id]);
			conn.release();
			if (result.rowCount > 0) {
				return result.rows[0];
			} else {
				throw new Error();
			}
		} catch (err) {
			throw new Error(`Unable to get category for id ${id}.\n${err}`);
		}
	}
}
