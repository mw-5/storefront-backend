import db from '../../../src/database';
import { OrderStore } from '../../../src/models/order';
import * as tu from '../../tests/testutils';

describe('Testsuite OrderStore:', () => {
	const store = new OrderStore();

	// Create
	describe('Test expects method create', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create new order', async () => {
			// Arrange
			const expectedOrder = tu.createEmptyTestOrder();
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
			const resultOrder1 = await store.create(tu.USER_ID);
			const resultOrder2 = await store.create(tu.USER_ID);

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
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.complete).toBeDefined();
		});

		it('to mark order as completed', async () => {
			// Arrange
			const expectedOrder = await store.create(tu.USER_ID);

			// Act
			const resultOrder = await store.complete(expectedOrder.id);

			// Assert
			expect(resultOrder.is_completed).toBeTrue();
		});

		it('to throw error on wrong order id', async () => {
			await expectAsync(store.complete('-1')).toBeRejectedWithError();
		});
	});

	describe('Test expects method addProduct', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.addProduct).toBeDefined();
		});

		it('to add a product to the order', async () => {
			// Arrange
			const order = tu.createEmptyTestOrder();
			const product = tu.createTestProduct();

			// Act
			const entryId = await store.addProduct(
				order.id,
				<string>product.id,
				2
			);

			// Assert
			expect(parseInt(entryId)).toBeGreaterThan(0);
		});

		it('to throw error for invalid quantity', async () => {
			// Arrange
			const order = tu.createEmptyTestOrder();
			const product = tu.createTestProduct();

			// Act & Assert
			await expectAsync(
				store.addProduct(order.id, <string>product.id, 0)
			).toBeRejectedWithError();
		});
	});
});
