import db from '../database';

/**
 * @description Data of table orders.
 */
export type Order = {
	id: string;
	products: {
		id: string;
		quantity: number;
	}[];
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
				const result = await conn.query(sql, [userId]);
				const newOrder = result.rows[0];
				conn.release();
				return {
					id: newOrder.id,
					products: [],
					user_id: newOrder.user_id,
					is_completed: newOrder.is_completed,
				};
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
	 * @param oid - The id of the order
	 * @param pid - The id of the product to be added
	 * @param quantity - The quantity of product to be added
	 * @returns - The id of the entry
	 */
	async addProduct(
		oid: string,
		pid: string,
		quantity: number
	): Promise<string> {
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
			const result = await conn.query(sql, [oid, pid, quantity]);
			conn.release();

			// Return id of entry
			return result.rows[0].id;
		} catch (err) {
			throw new Error(
				`Unable to add product ${pid} to order ${oid}.\n${err}`
			);
		}
	}

	/**
	 * @description Get order for given id.
	 * @param orderId - The id of the order
	 * @returns - The order
	 */
	async show(orderId: string): Promise<Order> {
		try {
			// Build query
			const sql =
				'SELECT op.order_id, o.user_id, op.product_id,' +
				' op.quantity, o.is_completed' +
				' FROM (orders AS o INNER JOIN order_products AS op' +
				' ON o.id = op.order_id)' +
				' INNER JOIN products AS p ON op.product_id = p.id' +
				' WHERE o.id = $1;';

			// Execute query
			const conn = await db.connect();
			const result = await conn.query(sql, [orderId]);
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
			throw new Error(`Unable to get order ${orderId}.\n${err}`);
		}
	}
}
