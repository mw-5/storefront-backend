import db from '../../../src/database';
import { Category, CategoryStore } from '../../../src/models/category';

describe('Testsuite CategoryStore:', () => {
	const store = new CategoryStore();
	const TEST_ID = '1';
	const TEST_NAME = 'testCategory';

	/**
	 * @description Populate tables categories.
	 */
	const populateTestDb = async (): Promise<void> => {
		const conn = await db.connect();

		// Populate table categories
		const sql = 'INSERT INTO categories (id, name) VALUES ($1, $2);';
		await conn.query(sql, [TEST_ID, TEST_NAME]);

		conn.release();
	};

	/**
	 * @description Empty tables categories.
	 */
	const emptyTestDb = async (): Promise<void> => {
		const conn = await db.connect();

		// Empty table categories
		const sql = 'DELETE FROM categories;';
		await conn.query(sql);

		conn.release();
	};

	/**
	 * @description Create a category to be used in tests.
	 * @returns - The test category
	 */
	const createTestCategory = (): Category => {
		return {
			id: TEST_ID,
			name: TEST_NAME,
		};
	};

	// Create
	describe('Test expects method create', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create a category', async () => {
			// Arrange
			const inputCategory = createTestCategory();

			// Act
			const newCategory = await store.create(inputCategory);

			// Assert
			// id is generated on creation
			// hence it has to be set on input afterwards
			// for input und result to be comparable.
			inputCategory.id = newCategory.id;
			expect(newCategory).toEqual(inputCategory);
		});
	});
});
