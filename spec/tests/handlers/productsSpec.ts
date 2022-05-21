import supertest from 'supertest';
import app from '../../../src/server';
import { Product } from '../../../src/models/product';
import db from '../../../src/database';

const request = supertest(app);

describe('Testsuite for products routes', () => {
	const ROUTE = '/products';
	const TEST_PRODUCT_NAME = 'testProduct';
	// PostgreSQL BIGINT is represented as string
	const TEST_PRODUCT_PRICE = '100';
	const TEST_CATEGORY_ID = '1';
	const TEST_CATEGORY_NAME = 'testCategory';

	/**
	 * @description Populate tables products and categories.
	 */
	const populateTestDb = async (): Promise<void> => {
		let sql: string;
		const conn = await db.connect();

		// Populate table categories
		sql = 'INSERT INTO categories (id, name) VALUES ($1, $2);';
		await conn.query(sql, [TEST_CATEGORY_ID, TEST_CATEGORY_NAME]);

		// Populate table products
		sql =
			'INSERT INTO products (name, price, category_id)' +
			' VALUES ($1, $2, $3);';
		await conn.query(sql, [
			TEST_PRODUCT_NAME,
			TEST_PRODUCT_PRICE,
			TEST_CATEGORY_ID,
		]);

		conn.release();
	};

	/**
	 * @description Empty tables products and categories.
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

		conn.release();
	};

	/**
	 * @description Create a product to be used in tests.
	 * @returns - The test product
	 */
	const createTestProduct = (): Product => {
		return {
			name: TEST_PRODUCT_NAME,
			price: TEST_PRODUCT_PRICE,
			category_id: TEST_CATEGORY_ID,
		};
	};

	describe('Test for endpoint POST products', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const newProduct = createTestProduct();

			// Act
			const response = await request.post(ROUTE).send(newProduct);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects response to contain new product', async () => {
			// Arrange
			const expectedProduct = createTestProduct();

			// Act
			const response = await request.post(ROUTE).send(expectedProduct);
			const newProduct = response.body;

			// Assert
			// id is generated on creation
			// hence it has to be set on input afterwards
			// for input und result to be comparable.
			expectedProduct.id = newProduct.id;
			expect(newProduct).toEqual(expectedProduct);
		});

		it('expects status code 400 on invalid input', async () => {
			// Arrange
			const newProduct = createTestProduct();
			newProduct.category_id = '-1';

			// Act
			const response = await request.post(ROUTE).send(newProduct);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
