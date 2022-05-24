import { ProductStore } from '../../../src/models/product';
import * as tu from '../../tests/testutils';

describe('Testsuite ProductStore:', () => {
	const store = new ProductStore();
	beforeAll(tu.emptyTestDb);

	// Create
	describe('Test expects method create', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create a product', async () => {
			// Arrange
			const inputProduct = tu.createTestProduct();

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
			const invalidProduct = tu.createTestProduct();
			invalidProduct.category_id = '-1';

			// Act & Assert
			await expectAsync(
				store.create(invalidProduct)
			).toBeRejectedWithError();
		});
	});

	// Read
	describe('Test expects method index', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be de defined', () => {
			expect(store.index).toBeDefined();
		});

		it('to return an array', async () => {
			const list = await store.index();
			expect(list.length).toBeGreaterThan(0);
		});

		it('to return products', async () => {
			// Arrange
			const expectedProduct = tu.createTestProduct();

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

	describe('Test expects method show', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.show).toBeDefined();
		});

		it('to return correct product', async () => {
			// Arrange
			const inputProduct = tu.createTestProduct();
			const expectedProduct = await store.create(inputProduct);
			const id = expectedProduct.id as string;

			// Act
			const resultProduct = await store.show(id);

			// Assert
			expect(resultProduct).toEqual(expectedProduct);
		});

		it('to throw an error if id is not found', async () => {
			// Arrange
			await tu.emptyTestDb();

			// Act & Assert
			await expectAsync(store.show('1')).toBeRejectedWithError();
		});
	});
});
