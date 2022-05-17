import db from '../database';

/**
 * @description Data of table orders.
 */
export type Order = {
	id: string;
	user_id: string;
	is_completed: boolean;
};

/**
 * @description Provides methods for interacting
 * with table orders of the database.
 */
export class OrderStore {
	/**
	 * @description Create a new order in the database or return an
	 * already existing one if the order is still active.
	 * @param userId - The id of the user associated with the order
	 * @returns - The currently active order
	 */
	async create(userId: string): Promise<Order> {
		try {
			const conn = await db.connect();

			// Check if user already has an active order
			let sql: string =
				'SELECT * FROM orders WHERE' +
				' user_id = $1 AND is_completed = FALSE;';
			const existingOrder = await conn.query(sql, [userId]);
			if (existingOrder.rowCount > 0) {
				// Return existing order
				conn.release();
				return existingOrder.rows[0];
			} else {
				// Create and return new order
				sql =
					'INSERT INTO orders (user_id, is_completed)' +
					' VALUES ($1, FALSE) RETURNING *;';
				const newOrder = await conn.query(sql, [userId]);
				conn.release();
				return newOrder.rows[0];
			}
		} catch (err) {
			throw new Error(
				`Unable to create order for user ${userId}.\n${err}`
			);
		}
	}
}
