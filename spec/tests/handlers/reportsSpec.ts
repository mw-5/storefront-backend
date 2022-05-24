import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import { Order, OrderStore } from '../../../src/models/order';

const request = supertest(app);

describe('Testsuite for reporting routes', () => {
	describe('Test for GET users/:id/current_order', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(
				`/users/${tu.USER_ID}/current_order`
			);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to recieve an active Order', async () => {
			// Act
			const response = await request.get(
				`/users/${tu.USER_ID}/current_order`
			);
			const resultOrder = response.body;

			// Assert
			expect(resultOrder.is_completed).toBeFalse();
		});

		it('expects to receive the correct order', async () => {
			// Arrange
			const expectedOrder = tu.createTestOrder();

			// Act
			const response = await request.get(
				`/users/${tu.USER_ID}/current_order`
			);
			const resultOrder = response.body;

			// Assert
			expect(resultOrder).toEqual(expectedOrder);
		});

		it('expects status code 400 for missing active order', async () => {
			// Act
			const response = await request.get(
				'/users/notExistingUser/current_order'
			);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('Test for endpoint GET users/:id/completed_orders', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const store = new OrderStore();
			await store.complete(tu.ORDER_ID);

			// Act
			const response = await request.get(
				`/users/${tu.USER_ID}/completed_orders`
			);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to receive completed orders', async () => {
			// Arrange
			const store = new OrderStore();
			await store.complete(tu.ORDER_ID);

			// Act
			const response = await request.get(
				`/users/${tu.USER_ID}/completed_orders`
			);
			const resultOrders = response.body;

			// Assert
			resultOrders.forEach((resultOrder: Order) => {
				expect(resultOrder.is_completed).toBeTrue();
			});
		});

		it('expects status code 400 for missing completed orders', async () => {
			// Act
			const response = await request.get(
				`/users/notExistingUser/completed_orders`
			);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('Test for endpoint GET categories/:id/products', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(
				`/categories/${tu.CATEGORY_ID}/products`
			);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to return an array', async () => {
			// Act
			const response = await request.get(
				`/categories/${tu.CATEGORY_ID}/products`
			);
			const resultProducts = response.body;

			// Assert
			expect(resultProducts.length).toBeGreaterThan(0);
		});

		it('expects status code 400 on invalid category', async () => {
			// Act
			const response = await request.get(
				`/categories/invalidCategory/products`
			);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
