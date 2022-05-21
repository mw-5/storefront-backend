import db from '../../src/database';
import { Order } from '../../src/models/order';
import { User } from '../../src/models/user';
import { Product } from '../../src/models/product';
import { Category } from '../../src/models/category';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Table products
// PostgreSQL BIGINT is represented as string
export const PRODUCT_ID = '1';
export const PRODUCT_NAME = 'testProduct';
export const PRODUCT_PRICE = '100';
// Tablel categories
export const CATEGORY_ID = '1';
export const CATEGORY_NAME = 'testCategory';
// Table users
export const USER_ID = 'testUsername';
export const USER_FIRST_NAME = 'testFirstName';
export const USER_LAST_NAME = 'testLastname';
export const USER_UNHASHED_PW = 'test123';
// Table orders
export const ORDER_ID = '1';
export const ORDER_IS_COMPLETED = false;
// Tabble order_products
export const ORDER_PRODUCTS_ID = '1';
export const ORDER_PRODUCTS_QUANTITY = 20;
// Password hashing
export const SALT_ROUNDS = process.env.SALT_ROUNDS as string;
export const PEPPER = process.env.BCRYPT_PASSWORD as string;

/**
 * @description Populate tables of database.
 */
export const populateTestDb = async (): Promise<void> => {
	let sql: string;
	const conn = await db.connect();

	// Populate table categories
	sql = 'INSERT INTO categories (id, name) VALUES ($1, $2);';
	await conn.query(sql, [CATEGORY_ID, CATEGORY_NAME]);

	// Populate table products
	sql =
		'INSERT INTO products (id, name, price, category_id)' +
		' VALUES ($1, $2, $3, $4);';
	await conn.query(sql, [
		PRODUCT_ID,
		PRODUCT_NAME,
		PRODUCT_PRICE,
		CATEGORY_ID,
	]);

	// Populate table users
	sql =
		'INSERT INTO users (id, first_name, last_name, password_digest)' +
		' VALUES ($1, $2, $3, $4);';
	const hashedPassword = bcrypt.hashSync(
		USER_UNHASHED_PW + PEPPER,
		parseInt(SALT_ROUNDS)
	);
	await conn.query(sql, [
		USER_ID,
		USER_FIRST_NAME,
		USER_LAST_NAME,
		hashedPassword,
	]);

	// Populate table orders
	sql =
		'INSERT INTO orders (id, user_id, is_completed)' +
		' VALUES ($1, $2, $3);';
	await conn.query(sql, [ORDER_ID, USER_ID, ORDER_IS_COMPLETED]);

	// Populate table order_products
	sql =
		'INSERT INTO order_products' +
		' (id, order_id, product_id, quantity)' +
		' VALUES ($1, $2, $3, $4);';
	await conn.query(sql, [
		ORDER_PRODUCTS_ID,
		ORDER_ID,
		PRODUCT_ID,
		ORDER_PRODUCTS_QUANTITY,
	]);

	conn.release();
};

/**
 * @description Empty tables of database.
 */
export const emptyTestDb = async (): Promise<void> => {
	let sql: string;
	const conn = await db.connect();

	// Empty table order_products
	sql = 'DELETE FROM order_products;';
	await conn.query(sql);

	// Empty table products
	sql = 'DELETE FROM products;';
	await conn.query(sql);

	// Empty table categories
	sql = 'DELETE FROM categories;';
	await conn.query(sql);

	// Empty table orders
	sql = 'DELETE FROM orders;';
	await conn.query(sql);

	// Empty table users
	sql = 'DELETE FROM users;';
	await conn.query(sql);

	// Empty table order_products
	sql = 'DELETE FROM order_products;';
	await conn.query(sql);

	conn.release();
};

/**
 * @description Create an order for use in tests.
 * @returns - The test order
 */
export const createTestOrder = (): Order => {
	return {
		id: ORDER_ID,
		products: [{ id: PRODUCT_ID, quantity: ORDER_PRODUCTS_QUANTITY }],
		user_id: USER_ID,
		is_completed: ORDER_IS_COMPLETED,
	};
};

/**
 * @description Create an order without products for use in tests.
 * @returns - The test order
 */
export const createEmptyTestOrder = (): Order => {
	return {
		id: ORDER_ID,
		products: [],
		is_completed: ORDER_IS_COMPLETED,
		user_id: USER_ID,
	};
};

/**
 * @description Create a user for use in tests.
 * @returns
 */
export const createTestUser = (): User => {
	return {
		id: USER_ID,
		first_name: USER_FIRST_NAME,
		last_name: USER_LAST_NAME,
		password: USER_UNHASHED_PW,
		password_digest: '',
	};
};

/**
 * @description Create a product to be used in tests.
 * @returns - The test product
 */
export const createTestProduct = (): Product => {
	return {
		id: PRODUCT_ID,
		name: PRODUCT_NAME,
		price: PRODUCT_PRICE,
		category_id: CATEGORY_ID,
	};
};

/**
 * @description Create a category to be used in tests.
 * @returns - The test category
 */
export const createTestCategory = (): Category => {
	return {
		id: CATEGORY_ID,
		name: CATEGORY_NAME,
	};
};
