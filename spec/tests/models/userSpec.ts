import { UserStore } from '../../../src/models/user';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as tu from '../../tests/testutils';

dotenv.config();

describe('Testsuite UserStore:', () => {
	const store = new UserStore();
	// Use this id for user created during test
	const TEST_ID_NEW = 'testNewUsername';

	describe('Test expects method create', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create correct password for new user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			expectedUser.id = TEST_ID_NEW;

			// Act
			const resultUser = await store.create(expectedUser);

			// Assert
			expect(
				bcrypt.compareSync(
					expectedUser.password + tu.PEPPER,
					resultUser.password_digest
				)
			).toBeTrue();
		});

		it('to create correct user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			expectedUser.id = TEST_ID_NEW;

			// Act
			const resultUser = await store.create(expectedUser);

			// Assert
			// For test on password creation see separate test
			expectedUser.password = '0';
			expectedUser.password_digest = '0';
			resultUser.password = '0';
			resultUser.password_digest = '0';
			expect(resultUser).toEqual(expectedUser);
		});

		it('to throw error if user already exists', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act & Assert
			await expectAsync(
				store.create(expectedUser)
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method authenticate', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.authenticate).toBeDefined();
		});

		it('to return user on sucess', async () => {
			// Act
			const resultUser = await store.authenticate(
				tu.USER_ID,
				tu.USER_UNHASHED_PW
			);

			// Assert
			expect(resultUser).not.toBeNull();
		});

		it('to return null for user that does not exist', async () => {
			// Act
			const resultUser = await store.authenticate(
				'nonExistingUser',
				tu.USER_UNHASHED_PW
			);

			// Assert
			expect(resultUser).toBeNull();
		});

		it('to return null on wrong password', async () => {
			// Act
			const resultUser = await store.authenticate(
				tu.USER_ID,
				'wrongPassword'
			);

			// Assert
			expect(resultUser).toBeNull();
		});
	});

	describe('Test method index', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.index).toBeDefined();
		});

		it('to return an array', async () => {
			const list = await store.index();
			expect(list.length).toBeGreaterThan(0);
		});

		it('to return users', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const list = await store.index();
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

	describe('Test method show', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(store.show).toBeDefined();
		});

		it('to return correct user', async () => {
			// Arrange
			const expectedUser = tu.createTestUser();

			// Act
			const resultUser = await store.show(expectedUser.id);

			// Assert
			// Set password and password_digest equal
			// between expectation and result because
			// each is only defined on one object of the two
			resultUser.password = expectedUser.password;
			expectedUser.password_digest = resultUser.password_digest;
			expect(resultUser).toEqual(expectedUser);
		});

		it('to throw an error if id is not found', async () => {
			// Arrange
			await tu.emptyTestDb();

			// Act & Assert
			await expectAsync(store.show(tu.USER_ID)).toBeRejectedWithError();
		});
	});
});
