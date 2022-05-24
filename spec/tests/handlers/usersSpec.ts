import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../../../src/models/user';

const request = supertest(app);

dotenv.config();

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
			// Extract created user from response
			const token = response.body;
			const payload = <jwt.JwtPayload>(
				jwt.verify(token, process.env.SECRET_TOKEN as string)
			);
			const resultUser = payload.user as User;

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
			// Extract created user from token
			const token = response.body;
			const payload = <jwt.JwtPayload>(
				jwt.verify(token, process.env.SECRET_TOKEN as string)
			);
			const resultUser = payload.user as User;

			// Assert
			// For test on password creation see separate test
			expect(resultUser.id).toEqual(expectedUser.id);
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
