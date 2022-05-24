import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import db from '../../../src/database';

const request = supertest(app);

describe('Testsuite for orders routes', () => {
	const ROUTE = '/orders';

	describe('Test for endpoint POST orders', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const userId = {
				userId: tu.USER_ID,
			};

			// Act
			const response = await request.post(ROUTE).send(userId);

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

			// Act
			const response = await request.post(ROUTE).send(userId);
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

			// Act
			const response1 = await request.post(ROUTE).send(userId);
			const resultOrder1 = response1.body;
			const response2 = await request.post(ROUTE).send(userId);
			const resultOrder2 = response2.body;

			// Assert
			expect(resultOrder1).toEqual(resultOrder2);
		});

		it('expects status code 400 for unknown user', async () => {
			// Arrange
			const userId = {
				userId: 'unknownUser',
			};

			// Act
			const response = await request.post(ROUTE).send(userId);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
