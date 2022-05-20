import db from '../../../src/database';
import { ReportQueries } from '../../../src/services/report';
import { Order, OrderStore } from '../../../src/models/order';
import { ProductStore } from '../../../src/models/product';

describe('Testsuite ReportQueries', () => {
	const queries = new ReportQueries();
	const TEST_ORDER_ID = '1';
	const TEST_ORDER_STATUS = false;
	const TEST_USER_ID = 'testUsername';
	const TEST_CATEGORY_ID = '1';
	const TEST_CATEGORY_NAME = 'testCategory';
	const TEST_PRODUCT_ID = '1';
	const TEST_PRODUCT_NAME = 'testProduct';
	const TEST_PRODUCT_PRICE = '100';
	const TEST_ORDER_PRODUCTS_ID = '1';
	const TEST_QUANTITY = 20;

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

		// Populate table order_products
		sql =
			'INSERT INTO order_products' +
			' (id, order_id, product_id, quantity)' +
			' VALUES ($1, $2, $3, $4);';
		await conn.query(sql, [
			TEST_ORDER_PRODUCTS_ID,
			TEST_ORDER_ID,
			TEST_PRODUCT_ID,
			TEST_QUANTITY,
		]);

		conn.release();
	};

	/**
	 * @description Empty tables of database.
	 */
	const emptyTestDb = async (): Promise<void> => {
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
	const createTestOrder = (): Order => {
		return {
			id: TEST_ORDER_ID,
			products: [{ id: TEST_PRODUCT_ID, quantity: TEST_QUANTITY }],
			user_id: TEST_USER_ID,
			is_completed: TEST_ORDER_STATUS,
		};
	};

	describe('Test expects currentOrderByUser', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(queries.currentOrderByUser).toBeDefined();
		});

		it('to return an active Order', async () => {
			// Act
			const resultOrder = await queries.currentOrderByUser(TEST_USER_ID);

			// Assert
			expect(resultOrder.is_completed).toBeFalse();
		});

		it('to return the correct order', async () => {
			// Arrange
			const expectedOrder = createTestOrder();

			// Act
			const resultOrder = await queries.currentOrderByUser(TEST_USER_ID);

			// Assert
			expect(resultOrder).toEqual(expectedOrder);
		});

		it('to throw error for missing active order', async () => {
			// Act & Assert
			await expectAsync(
				queries.currentOrderByUser('notExistingUser')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method completedOrdersByUser', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(queries.completedOrdersByUser).toBeDefined();
		});

		it('to return completed orders', async () => {
			// Arrange
			const store = new OrderStore();
			store.complete(TEST_ORDER_ID);

			// Act
			const resultOrders = await queries.completedOrdersByUser(
				TEST_USER_ID
			);

			// Assert
			resultOrders.forEach((resultOrder) => {
				expect(resultOrder.is_completed).toBeTrue();
			});
		});

		it('to throw error for missing completed orders', async () => {
			// Act & Assert
			await expectAsync(
				queries.completedOrdersByUser('notExistingUser')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method productsByCategory', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(queries.productsByCategory).toBeDefined();
		});

		it('to return an array', async () => {
			// Act
			const resultProducts = await queries.productsByCategory(
				TEST_CATEGORY_ID
			);

			// Assert
			expect(resultProducts.length).toBeGreaterThan(0);
		});

		it('to throw error for invalid category', async () => {
			await expectAsync(
				queries.productsByCategory('-1')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method topFiveProducts', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(queries.topFiveProducts).toBeDefined();
		});

		it('to return an array of five', async () => {
			// Arrange
			const p0 = {
				name: TEST_PRODUCT_NAME,
				category_id: TEST_CATEGORY_ID,
				price: TEST_PRODUCT_PRICE,
			};
			const productStore = new ProductStore();
			const orderStore = new OrderStore();
			// Create products and add them to the cart
			const p1 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p1.id, 10);
			const p2 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p2.id, 15);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p2.id, 15);
			const p3 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p3.id, 11);
			const p4 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p4.id, 12);
			const p5 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p5.id, 20);
			const p6 = await productStore.create(p0);
			await orderStore.addProduct(TEST_ORDER_ID, <string>p6.id, 5);

			// Act
			const result = await queries.topFiveProducts();

			// Assert
			expect(result.length).toEqual(5);
		});
	});
});
