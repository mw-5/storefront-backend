import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../../../src/models/user';

const request = supertest(app);

dotenv.config();

describe('Testsuite for users routes', () => {
	const ROUTE = '/users';
	const TEST_ID_NEW = 'newTestUser';
	beforeAll(tu.emptyTestDb);

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

	describe('Test for endpoint POST users/login', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on sucess', async () => {
			// Arrange
			const user = tu.createTestUser();

			// Act
			const response = await request.post(`${ROUTE}/login`).send(user);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to receive JWT with correct user id', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const response = await request
				.post(`${ROUTE}/login`)
				.send(expectedUser);
			// Extract user from response
			const token = response.body;
			const payload = <JwtPayload>(
				jwt.verify(token, <string>process.env.SECRET_TOKEN)
			);
			const resultUser = <User>payload.user;

			// Assert
			expect(resultUser.id).toEqual(expectedUser.id);
		});

		it('expects status code 401 for unauthorized user', async () => {
			// Arrange
			const user = {
				id: 'notExistingUser',
				password: '123',
			};

			// Act
			const response = await request.post(`${ROUTE}/login`).send(user);

			// Assert
			expect(response.statusCode).toEqual(401);
		});
	});

	describe('Test for endpoint GET users', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			const response = await request.get(ROUTE);
			expect(response.statusCode).toEqual(200);
		});

		it('expects to return an array', async () => {
			// Act
			const response = await request.get(ROUTE);
			const result = response.body;

			// Assert
			expect(result.length).toBeGreaterThan(0);
		});

		it('expects to return users', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const response = await request.get(ROUTE);
			const list = response.body;
			const resultUser = list[0];

			// Assert
			// Set password and password_digest equal
			// between expectation and result because
			// each is only defined on one object of the two
			resultUser.password = expectedUser.password;
			expectedUser.password_digest = resultUser.password_digest;
			expect(resultUser).toEqual(expectedUser);
		});
	});

	describe('Test for endpoint GET users/:id', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			const response = await request.get(`${ROUTE}/${tu.USER_ID}`);
			expect(response.statusCode).toEqual(200);
		});

		it('expects to recieve correct user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const response = await request.get(`${ROUTE}/${expectedUser.id}`);
			const resultUser = response.body;

			// Assert
			// Set password and password_digest equal
			// between expectation and result because
			// each is only defined on one object of the two
			resultUser.password = expectedUser.password;
			expectedUser.password_digest = resultUser.password_digest;
			expect(resultUser).toEqual(expectedUser);
		});

		it('expects status code 400 on invalid input', async () => {
			// Act
			const response = request.get(`${ROUTE}/invalidId}`);

			// Assert
			expect((await response).statusCode).toEqual(400);
		});
	});
});
