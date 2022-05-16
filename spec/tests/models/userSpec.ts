import db from '../../../src/database';
import { User, UserStore } from '../../../src/models/user';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

describe('Testsuite UserStore:', () => {
	const store = new UserStore();
	// Use this id for prepopulated user
	const TEST_ID = 'testUsername';
	// Use this id for user created during test
	const TEST_ID_NEW = 'testNewUsername';
	const TEST_FIRST_NAME = 'testFirstName';
	const TEST_LAST_NAME = 'testLastname';
	const TEST_UNHASHED_PW = 'test123';
	const SALT_ROUNDS = process.env.SALT_ROUNDS as string;
	const PEPPER = process.env.BCRYPT_PASSWORD as string;

	/**
	 * @description Populate users table.
	 */
	const populateTestDb = async (): Promise<void> => {
		const conn = await db.connect();

		const sql =
			'INSERT INTO users (id, first_name, last_name, password_digest)' +
			' VALUES ($1, $2, $3, $4);';
		const hashedPassword = bcrypt.hashSync(
			TEST_UNHASHED_PW + PEPPER,
			parseInt(SALT_ROUNDS)
		);
		await conn.query(sql, [
			TEST_ID,
			TEST_FIRST_NAME,
			TEST_LAST_NAME,
			hashedPassword,
		]);

		conn.release();
	};

	/**
	 * @description Empty users table.
	 */
	const emptyTestDb = async (): Promise<void> => {
		const conn = await db.connect();

		const sql = 'DELETE FROM users;';
		await conn.query(sql);

		conn.release();
	};

	/**
	 * @description Create a user for use in tests.
	 * @returns
	 */
	const createTestUser = (): User => {
		return {
			id: TEST_ID,
			first_name: TEST_FIRST_NAME,
			last_name: TEST_LAST_NAME,
			password: TEST_UNHASHED_PW,
			password_digest: '',
		};
	};

	describe('Test expects method create', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.create).toBeDefined();
		});

		it('to create correct password for new user', async () => {
			// Arrange
			const expectedUser = createTestUser();
			// Assign this id to avoid conflict with
			// prepopulated user
			expectedUser.id = TEST_ID_NEW;

			// Act
			const resultUser = await store.create(expectedUser);

			// Assert
			expect(
				bcrypt.compareSync(
					expectedUser.password + PEPPER,
					resultUser.password_digest
				)
			).toBeTrue();
		});

		it('to create correct user', async () => {
			// Arrange
			const expectedUser = createTestUser();
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
			const expectedUser = createTestUser();

			// Act & Assert
			await expectAsync(
				store.create(expectedUser)
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method authenticate', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.authenticate).toBeDefined();
		});

		it('to return user on sucess', async () => {
			// Act
			const resultUser = await store.authenticate(
				TEST_ID,
				TEST_UNHASHED_PW
			);

			// Assert
			expect(resultUser).not.toBeNull();
		});

		it('to return null for user that does not exist', async () => {
			// Act
			const resultUser = await store.authenticate(
				'nonExistingUser',
				TEST_UNHASHED_PW
			);

			// Assert
			expect(resultUser).toBeNull();
		});

		it('to return null on wrong password', async () => {
			// Act
			const resultUser = await store.authenticate(
				TEST_ID,
				'wrongPassword'
			);

			// Assert
			expect(resultUser).toBeNull();
		});
	});

	describe('Test method index', () => {
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.index).toBeDefined();
		});

		it('to return an array', async () => {
			const list = await store.index();
			expect(list.length).toBeGreaterThan(0);
		});

		it('to return users', async () => {
			// Arrange
			const expectedUser = createTestUser();

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
		beforeEach(populateTestDb);
		afterEach(emptyTestDb);

		it('to be defined', () => {
			expect(store.show).toBeDefined();
		});

		it('to return correct user', async () => {
			// Arrange
			const expectedUser = createTestUser();

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
			await emptyTestDb();

			// Act & Assert
			expectAsync(store.show(TEST_ID)).toBeRejectedWithError();
		});
	});
});
