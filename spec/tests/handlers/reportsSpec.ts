import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';

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
});
