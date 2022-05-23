import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import bcrypt from 'bcrypt';

const request = supertest(app);

describe('Testsuite for users routes', () => {
	const ROUTE = '/users';
	const TEST_ID_NEW = 'newTestUser';

	describe('Test for endpoint POST users', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const inputUser = tu.createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			inputUser.id = TEST_ID_NEW;

			// Act
			const response = await request.post(ROUTE).send(inputUser);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to create correct password for new user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			expectedUser.id = TEST_ID_NEW;

			// Act
			const response = await request.post(ROUTE).send(expectedUser);
			const resultUser = response.body;

			// Assert
			expect(
				bcrypt.compareSync(
					expectedUser.password + tu.PEPPER,
					resultUser.password_digest
				)
			).toBeTrue();
		});

		it('expects response to contain correct user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			expectedUser.id = TEST_ID_NEW;

			// Act
			const response = await request.post(ROUTE).send(expectedUser);
			const resultUser = response.body;

			// Assert
			// For test on password creation see separate test
			expectedUser.password = '0';
			expectedUser.password_digest = '0';
			resultUser.password = '0';
			resultUser.password_digest = '0';
			expect(resultUser).toEqual(expectedUser);
		});

		it('expects status code 400 if user already exists', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const response = await request.post(ROUTE).send(expectedUser);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
