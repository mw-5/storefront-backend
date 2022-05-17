import db from '../database';

/**
 * @description Data of table orders.
 */
export type Order = {
	id: string;
	user_id: string;
	status: string;
};

/**
 * @description Provides methods for interacting
 * with table orders of the database.
 */
export class OrderStore {
	/**
	 * @description Create a new order in the database.
	 * @param userId - The id of the user associated with the order
	 * @returns - The created order
	 */
	async create(userId: string): Promise<Order> {
		try {
			const sql =
				'INSERT INTO orders (user_id, status)' +
				' VALUES ($1, $2) RETURNING *;';
			const conn = await db.connect();
			const result = await conn.query(sql, [userId, 'active']);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(
				`Unable to create order for user ${userId}.\n${err}`
			);
		}
	}
}
