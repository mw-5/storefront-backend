import db from '../../../src/database';
import { Product, ProductStore } from '../../../src/models/product';

describe('Testsuite ProductStore:', () => {
	const store = new ProductStore();
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

	// Create
	describe('Test expects method create', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create a product', async () => {
			// Arrange
			const inputProduct = createTestProduct();

			// Act
			const newProduct = await store.create(inputProduct);

			// Assert
			// id is generated on creation
			// hence it has to be set on input afterwards
			// for input und result to be comparable.
			inputProduct.id = newProduct.id;
			expect(newProduct).toEqual(inputProduct);
		});

		it('to throw error for invalid category', async () => {
			// Arrange
			const invalidProduct = createTestProduct();
			invalidProduct.category_id = '-1';

			// Act & Assert
			await expectAsync(
				store.create(invalidProduct)
			).toBeRejectedWithError();
		});
	});

	// Read
	describe('Test expects method index', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be de defined', () => {
			expect(store.index).toBeDefined();
		});

		it('to return an array', async () => {
			const list = await store.index();
			expect(list.length).toBeGreaterThan(0);
		});

		it('to return products', async () => {
			// Arrange
			const expectedProduct = createTestProduct();

			// Act
			const list = await store.index();
			const resultProduct = list[0];

			// Assert
			// Set id to 0 to compare object
			// despite serial generaton of id
			expectedProduct.id = '0';
			resultProduct.id = '0';
			expect(resultProduct).toEqual(expectedProduct);
		});
	});
});
