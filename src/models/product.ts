import db from '../database';

/**
 * @description Data of table products
 */
export type Product = {
	// Use string for BIGINT
	id?: string;
	name: string;
	price: string;
	category_id: string;
};

/**
 * @description Provides CRUD methods for table products
 * of the database.
 */
export class ProductStore {
	/**
	 * @description Create provided product in the database.
	 * @param p - The product that should be created
	 * @returns - The new product
	 */
	async create(p: Product): Promise<Product> {
		try {
			const sql =
				'INSERT INTO products (name, price, category_id)' +
				' VALUES ($1, $2, $3) RETURNING *;';
			const conn = await db.connect();
			const result = await conn.query(sql, [
				p.name,
				p.price,
				p.category_id,
			]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Unable to create product ${p}.\n${err}`);
		}
	}

	/**
	 * @description List all products from the database.
	 * @returns - The list of products
	 */
	async index(): Promise<Product[]> {
		try {
			const sql = 'SELECT * FROM products';
			const conn = await db.connect();
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Unable to get list of products.\n${err}`);
		}
	}
}
