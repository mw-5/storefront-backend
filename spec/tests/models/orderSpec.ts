import db from '../../../src/database';
import { Order, OrderStore } from '../../../src/models/order';

describe('Testsuite OrderStore:', () => {
	const store = new OrderStore();
	const TEST_ORDER_ID = '1';
	const TEST_ORDER_STATUS = false;
	const TEST_USER_ID = 'testUsername';
	const TEST_CATEGORY_ID = '1';
	const TEST_CATEGORY_NAME = 'testCategory';
	const TEST_PRODUCT_ID = '1';
	const TEST_PRODUCT_NAME = 'testProduct';
	const TEST_PRODUCT_PRICE = '100';

	/**
	 * @description Populate tables of database.
	 */
	const populateTestDb = async (): Promise<void> => {
		let sql: string;
		const conn = await db.connect();

		// Populate table categories
		sql = 'INSERT INTO categories (id, name) VALUES ($1, $2);';
		await conn.query(sql, [TEST_CATEGORY_ID, TEST_CATEGORY_NAME]);

		// Populate table products
		sql =
			'INSERT INTO products (id, name, price, category_id)' +
			' VALUES ($1, $2, $3, $4);';
		await conn.query(sql, [
			TEST_PRODUCT_ID,
			TEST_PRODUCT_NAME,
			TEST_PRODUCT_PRICE,
			TEST_CATEGORY_ID,
		]);

		// Populate table users
		sql = 'INSERT INTO users (id) VALUES ($1);';
		await conn.query(sql, [TEST_USER_ID]);

		// Populate table orders
		sql =
			'INSERT INTO orders (id, user_id, is_completed)' +
			' VALUES ($1, $2, $3);';
		await conn.query(sql, [TEST_ORDER_ID, TEST_USER_ID, TEST_ORDER_STATUS]);

		conn.release();
	};

	/**
	 * @description Empty tables of database.
	 */
	const emptyTestDb = async (): Promise<void> => {
		let sql: string;
		const conn = await db.connect();

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

		conn.release();
	};

	/**
	 * @description Create an order to be used in tests.
	 * @returns - The test order
	 */
	const createTestOrder = (): Order => {
		return {
			id: TEST_ORDER_ID,
			user_id: TEST_USER_ID,
			is_completed: TEST_ORDER_STATUS,
		};
	};

	// Create
	describe('Test expects method create', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create new order', async () => {
			// Arrange
			const expectedOrder = createTestOrder();
			const conn = await db.connect();
			const sql = 'UPDATE orders SET is_completed = true;';
			await conn.query(sql);
			conn.release();

			// Act
			const resultOrder = await store.create(expectedOrder.user_id);

			// Assert
			// Replace id becaue due to serial generation
			// id is unknown beforehand
			expectedOrder.id = resultOrder.id;
			expect(resultOrder).toEqual(expectedOrder);
		});

		it('to return existing active order', async () => {
			// Act
			const resultOrder1 = await store.create(TEST_USER_ID);
			const resultOrder2 = await store.create(TEST_USER_ID);

			// Assert
			expect(resultOrder1).toEqual(resultOrder2);
		});

		it('to throw error for unknown user', async () => {
			await expectAsync(
				store.create('nonExistingUserId')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method complete', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.complete).toBeDefined();
		});

		it('to mark order as completed', async () => {
			// Arrange
			const expectedOrder = await store.create(TEST_USER_ID);

			// Act
			const resultOrder = await store.complete(expectedOrder.id);

			// Assert
			expect(resultOrder.is_completed).toBeTrue();
		});

		it('to throw error on wrong order id', async () => {
			await expectAsync(store.complete('-1')).toBeRejectedWithError();
		});
	});
});
