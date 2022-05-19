import db from '../database';
import { Order } from '../models/order';

export class ReportQueries {
	/**
	 * @description Get the current active order of given user
	 * @param userId - The id of the user
	 * @returns - The currently active order for user or null
	 * if no currently active order exists
	 */
	async currentOrderByUser(userId: string): Promise<Order> {
		try {
			// Build query
			const sql =
				'SELECT op.order_id, o.user_id, op.product_id,' +
				' op.quantity, o.is_completed' +
				' FROM (orders AS o INNER JOIN order_products AS op' +
				' ON o.id = op.order_id)' +
				' INNER JOIN products AS p ON op.product_id = p.id' +
				' WHERE o.is_completed = FALSE AND o.user_id = $1;';

			// Execute query
			const conn = await db.connect();
			const result = await conn.query(sql, [userId]);
			conn.release();

			// Check if query returned results
			if (result.rowCount === 0) {
				throw new Error();
			}

			// Build order
			const products: { id: string; quantity: number }[] = [];
			result.rows.forEach((row) => {
				products.push({ id: row.product_id, quantity: row.quantity });
			});
			const order: Order = {
				id: result.rows[0].order_id,
				products: products,
				user_id: result.rows[0].user_id,
				is_completed: result.rows[0].is_completed,
			};

			return order;
		} catch (err) {
			throw new Error(`Unable to find active order for user ${userId}`);
		}
	}
}
