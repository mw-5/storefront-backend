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
export class OrderStore {}
