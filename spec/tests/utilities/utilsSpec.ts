import supertest from 'supertest';
import { verifyUser } from '../../../src/utilities/utils';
import * as tu from '../testutils';
import app from '../../../src/server';

describe('Testsuite for utils', () => {
	describe('Test expects verifyUser', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);
		const request = supertest(app);

		it('to be defined', () => {
			expect(verifyUser).toBeDefined();
		});

		it('to return correct user id for authorized user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();
			const authHeader = await tu.getAuthHeader(request);

			// Act
			const userId = verifyUser(authHeader.Authorization);

			// Assert
			expect(userId).toEqual(expectedUser.id);
		});

		it('to return null for unauthorized user', () => {
			// Act
			const userId = verifyUser('Bearer invalidToken');

			// Assert
			expect(userId).toBeNull();
		});
	});
});
