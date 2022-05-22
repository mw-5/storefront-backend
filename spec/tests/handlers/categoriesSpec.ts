import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';

const request = supertest(app);

fdescribe('Testsuite for categories routes', () => {
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
});
