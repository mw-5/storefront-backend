import supertest from 'supertest';
import { CategoryStore } from '../../../src/models/category';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';

const request = supertest(app);

describe('Testsuite for categories routes', () => {
	const ROUTE = '/categories';

	describe('Test for endpoint POST categories', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			const response = await request
				.post(ROUTE)
				.send(tu.createTestCategory());
			expect(response.statusCode).toEqual(200);
		});

		it('expects response to contain new category', async () => {
			// Arrange
			const expectedCategory = tu.createTestCategory();

			// Act
			const response = await request.post(ROUTE).send(expectedCategory);
			const newCategory = response.body;

			// Assert
			// id is generated on creation
			// hence it has to be set on input afterwards
			// for input und result to be comparable.
			expectedCategory.id = newCategory.id;
			expect(newCategory).toEqual(expectedCategory);
		});
	});

	describe('Test for endpoint GET categories', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			const response = await request.get(ROUTE);
			expect(response.statusCode).toEqual(200);
		});

		it('expects result to contain array', async () => {
			// Act
			const response = await request.get(ROUTE);

			// Assert
			expect(response.body.length).toBeGreaterThan(0);
		});

		it('expects to retrieve categories', async () => {
			// Arrange
			const expectedCategory = tu.createTestCategory();

			// Act
			const response = await request.get(ROUTE);
			const resultCategory = response.body[0];

			// Assert
			// Set id to 0 to compare object
			// despite serial generaton of id
			expectedCategory.id = '0';
			resultCategory.id = '0';
			expect(resultCategory).toEqual(expectedCategory);
		});
	});

	fdescribe('Test for endpoint GET categories/:id', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(`${ROUTE}/${tu.CATEGORY_ID}`);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects to retrieve correct category', async () => {
			// Arrange
			const store = new CategoryStore();
			const inputCategory = tu.createTestCategory();
			const expectedCategory = await store.create(inputCategory);

			// Act
			const response = await request.get(
				`${ROUTE}/${expectedCategory.id}`
			);
			const resultCategory = response.body;

			// Assert
			expect(resultCategory).toEqual(expectedCategory);
		});

		it('expects status code 400 for invalid input', async () => {
			// Act
			const response = await request.get(`${ROUTE}/invalidId`);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});
});
