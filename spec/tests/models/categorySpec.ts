import { CategoryStore } from '../../../src/models/category';
import * as tu from '../../tests/testutils';

describe('Testsuite CategoryStore:', () => {
	const store = new CategoryStore();
	beforeAll(tu.emptyTestDb);

	// Create
	describe('Test expects method create', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create a category', async () => {
			// Arrange
			const inputCategory = tu.createTestCategory();

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

	// Read
	describe('Test expects method index', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.index).toBeDefined();
		});

		it('to return an array', async () => {
			const list = await store.index();
			expect(list.length).toBeGreaterThan(0);
		});

		it('to return categories', async () => {
			// Arrange
			const expectedCategory = tu.createTestCategory();

			// Act
			const list = await store.index();
			const resultCategory = list[0];

			// Assert
			// Set id to 0 to compare object
			// despite serial generaton of id
			expectedCategory.id = '0';
			resultCategory.id = '0';
			expect(resultCategory).toEqual(expectedCategory);
		});
	});

	describe('Test expects method show', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.show).toBeDefined();
		});

		it('to return correct category', async () => {
			// Arrange
			const inputCategory = tu.createTestCategory();
			const expectedCategory = await store.create(inputCategory);
			const id = expectedCategory.id as string;

			// Act
			const resultCategory = await store.show(id);

			// Assert
			expect(resultCategory).toEqual(expectedCategory);
		});

		it('to throw error for invalid id', async () => {
			await expectAsync(store.show('a')).toBeRejectedWithError();
		});

		it('to throw error if id is not found', async () => {
			// Arrange
			await tu.emptyTestDb();

			// Act & Assert
			await expectAsync(store.show('1')).toBeRejectedWithError();
		});
	});
});
