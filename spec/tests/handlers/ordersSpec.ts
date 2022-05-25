import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import db from '../../../src/database';

const request = supertest(app);

describe('Testsuite for orders routes', () => {
	const ROUTE = '/orders';
	beforeAll(tu.emptyTestDb);

	describe('Test for endpoint POST orders', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const userId = {
				userId: tu.USER_ID,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(ROUTE)
				.set(authHeader)
				.send(userId);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to create new order', async () => {
			// Arrange
			const expectedOrder = tu.createEmptyTestOrder();
			const conn = await db.connect();
			const sql = 'UPDATE orders SET is_completed = true;';
			await conn.query(sql);
			conn.release();
			const userId = {
				userId: expectedOrder.user_id,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(ROUTE)
				.set(authHeader)
				.send(userId);
			const resultOrder = response.body;

			// Assert
			// Replace id becaue due to serial generation
			// id is unknown beforehand
			expectedOrder.id = resultOrder.id;
			expect(resultOrder).toEqual(expectedOrder);
		});

		it('expects to receive existing active order', async () => {
			// Arrange
			const userId = {
				userId: tu.USER_ID,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response1 = await request
				.post(ROUTE)
				.set(authHeader)
				.send(userId);
			const resultOrder1 = response1.body;
			const response2 = await request
				.post(ROUTE)
				.set(authHeader)
				.send(userId);
			const resultOrder2 = response2.body;

			// Assert
			expect(resultOrder1).toEqual(resultOrder2);
		});

		it('expects status code 401 for unknown user', async () => {
			// Arrange
			const userId = {
				userId: 'unknownUser',
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(ROUTE)
				.set(authHeader)
				.send(userId);

			// Assert
			expect(response.statusCode).toEqual(401);
		});
	});

	describe('Test for endpoint orders/:id/complete', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.put(`${ROUTE}/${tu.ORDER_ID}/complete`)
				.set(authHeader);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to mark order as completed', async () => {
			// Arrange
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.put(`${ROUTE}/${tu.ORDER_ID}/complete`)
				.set(authHeader);
			const resultOrder = response.body;

			// Assert
			expect(resultOrder.is_completed).toBeTrue();
		});

		it('exptects status code 400 for invalid order id', async () => {
			// Arrange
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.put(`${ROUTE}/invalidOrderId/complete`)
				.set(authHeader);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('Test for endpoint POST orders/:id/products', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const product = {
				productId: tu.PRODUCT_ID,
				quantity: tu.ORDER_PRODUCTS_QUANTITY,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(`${ROUTE}/${tu.ORDER_ID}/products`)
				.set(authHeader)
				.send(product);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to add product to order', async () => {
			// Arrange
			const product = {
				productId: tu.PRODUCT_ID,
				quantity: tu.ORDER_PRODUCTS_QUANTITY,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(`${ROUTE}/${tu.ORDER_ID}/products`)
				.set(authHeader)
				.send(product);
			const entryId = response.body;

			// Assert
			expect(entryId).toBeGreaterThan(0);
		});

		it('expects status code 400 for invalid quantity', async () => {
			// Arrange
			const product = {
				productId: tu.PRODUCT_ID,
				quantity: 0,
			};
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const response = await request
				.post(`${ROUTE}/${tu.ORDER_ID}/products`)
				.set(authHeader)
				.send(product);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('Test for endpoint GET orders/:id', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(`${ROUTE}/${tu.ORDER_ID}`);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to receive order with correct id', async () => {
			// Act
			const response = await request.get(`${ROUTE}/${tu.ORDER_ID}`);
			const order = response.body;

			// Assert
			expect(order.id).toEqual(tu.ORDER_ID);
		});

		it('expects status code 400 for invalid order id', async () => {
			// Act
			const response = await request.get(`${ROUTE}/invalidOrderId`);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
