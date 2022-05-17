import db from '../database';
import { Product } from './product';

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

	/**
	 * @description Mark order as complete.
	 * @param orderId - The id of the order
	 * @returns - The updated order from the database
	 */
	async complete(orderId: string): Promise<Order> {
		try {
			const sql =
				'UPDATE orders SET is_completed = TRUE' +
				' WHERE id = $1 RETURNING *;';
			const conn = await db.connect();
			const result = await conn.query(sql, [orderId]);
			conn.release();
			// Check if update succeeded
			if (result.rowCount > 0) {
				return result.rows[0];
			} else {
				throw new Error();
			}
		} catch (err) {
			throw new Error(`Unable to update order ${orderId}.\n${err}`);
		}
	}

	/**
	 * @description Add a product to an order.
	 * @param o - The order
	 * @param p - The product to be added
	 * @param quantity - The quantity of product to be added
	 * @returns - The id of the entry
	 */
	async addProduct(o: Order, p: Product, quantity: number): Promise<string> {
		try {
			// Validate quantity
			if (quantity < 1) {
				throw Error('Quantity must be greater than 0');
			}

			// Generate entry
			const sql =
				'INSERT INTO order_products (order_id, product_id, quantity)' +
				' VALUES ($1, $2, $3) RETURNING id;';
			const conn = await db.connect();
			const result = await conn.query(sql, [o.id, p.id, quantity]);
			conn.release();

			// Return id of entry
			return result.rows[0].id;
		} catch (err) {
			throw new Error(
				`Unable to add product ${p.id} to order ${o.id}.\n${err}`
			);
		}
	}
}
