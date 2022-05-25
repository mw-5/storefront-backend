import supertest from 'supertest';
import app from '../../src/server';

const request = supertest(app);

describe('Testsuite for base route', () => {
	describe('Test for endpoint GET /', () => {
		it('expects status code 200 on success', async () => {
			// Act
			const response = await request.get('/');

			// Assert
			expect(response.statusCode).toEqual(200);
		});
	});
});
