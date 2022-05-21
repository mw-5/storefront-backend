import supertest from 'supertest';
import app from '../../../src/server';
import * as tu from '../../tests/testutils';

const request = supertest(app);

describe('Testsuite for products routes', () => {
	const ROUTE = '/products';

	describe('Test for endpoint POST products', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Arrange
			const newProduct = tu.createTestProduct();

			// Act
			const response = await request.post(ROUTE).send(newProduct);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects response to contain new product', async () => {
			// Arrange
			const expectedProduct = tu.createTestProduct();

			// Act
			const response = await request.post(ROUTE).send(expectedProduct);
			const newProduct = response.body;

			// Assert
			// id is generated on creation
			// hence it has to be set on input afterwards
			// for input und result to be comparable.
			expectedProduct.id = newProduct.id;
			expect(newProduct).toEqual(expectedProduct);
		});

		it('expects status code 400 on invalid input', async () => {
			// Arrange
			const newProduct = tu.createTestProduct();
			newProduct.category_id = '-1';

			// Act
			const response = await request.post(ROUTE).send(newProduct);

			// Assert
			expect(response.statusCode).toEqual(400);
		});
	});

	describe('Test for endpoint GET products', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get(ROUTE);

			// Assert
			expect(response.statusCode).toEqual(200);
		});

		it('expects an array on success', async () => {
			// Act
			const response = await request.get(ROUTE);

			// Assert
			expect(response.body.length).toBeGreaterThan(0);
		});

		it('expects to retrieve products', async () => {
			// Arrange
			const expectedProduct = tu.createTestProduct();

			// Act
			const response = await request.get(ROUTE);
			const resultProduct = response.body[0];

			// Assert
			// Set id to 0 to compare object
			// despite serial generaton of id
			expectedProduct.id = '0';
			resultProduct.id = '0';
			expect(resultProduct).toEqual(expectedProduct);
		});
	});
});
