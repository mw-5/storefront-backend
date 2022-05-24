import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import { Order, OrderStore } from '../../../src/models/order';
import { ProductStore } from '../../../src/models/product';

const request = supertest(app);

describe('Testsuite for reporting routes', () => {
	beforeAll(tu.emptyTestDb);

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

	describe('Test for endpoint GET top_5_popular_products', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);
		const ROUTE = '/top_5_popular_products';

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(ROUTE);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to return an array of five', async () => {
			// Arrange
			const p0 = {
				name: tu.PRODUCT_NAME,
				category_id: tu.CATEGORY_ID,
				price: tu.PRODUCT_PRICE,
			};
			const productStore = new ProductStore();
			const orderStore = new OrderStore();
			// Create products and add them to the cart
			const p1 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p1.id, 10);
			const p2 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p2.id, 15);
			await orderStore.addProduct(tu.ORDER_ID, <string>p2.id, 15);
			const p3 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p3.id, 11);
			const p4 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p4.id, 12);
			const p5 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p5.id, 20);
			const p6 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p6.id, 5);

			// Act
			const response = await request.get(ROUTE);
			const result = response.body;

			// Assert
			expect(result.length).toEqual(5);
		});
	});
});
