import { ReportQueries } from '../../../src/services/report';
import { OrderStore } from '../../../src/models/order';
import { ProductStore } from '../../../src/models/product';
import * as tu from '../../tests/testutils';

describe('Testsuite ReportQueries', () => {
	const queries = new ReportQueries();

	describe('Test expects currentOrderByUser', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(queries.currentOrderByUser).toBeDefined();
		});

		it('to return an active Order', async () => {
			// Act
			const resultOrder = await queries.currentOrderByUser(tu.USER_ID);

			// Assert
			expect(resultOrder.is_completed).toBeFalse();
		});

		it('to return the correct order', async () => {
			// Arrange
			const expectedOrder = tu.createTestOrder();

			// Act
			const resultOrder = await queries.currentOrderByUser(tu.USER_ID);

			// Assert
			expect(resultOrder).toEqual(expectedOrder);
		});

		it('to throw error for missing active order', async () => {
			// Act & Assert
			await expectAsync(
				queries.currentOrderByUser('notExistingUser')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method completedOrdersByUser', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(queries.completedOrdersByUser).toBeDefined();
		});

		it('to return completed orders', async () => {
			// Arrange
			const store = new OrderStore();
			await store.complete(tu.ORDER_ID);

			// Act
			const resultOrders = await queries.completedOrdersByUser(
				tu.USER_ID
			);

			// Assert
			resultOrders.forEach((resultOrder) => {
				expect(resultOrder.is_completed).toBeTrue();
			});
		});

		it('to throw error for missing completed orders', async () => {
			// Act & Assert
			await expectAsync(
				queries.completedOrdersByUser('notExistingUser')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method productsByCategory', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(queries.productsByCategory).toBeDefined();
		});

		it('to return an array', async () => {
			// Act
			const resultProducts = await queries.productsByCategory(
				tu.CATEGORY_ID
			);

			// Assert
			expect(resultProducts.length).toBeGreaterThan(0);
		});

		it('to throw error for invalid category', async () => {
			await expectAsync(
				queries.productsByCategory('-1')
			).toBeRejectedWithError();
		});
	});

	describe('Test expects method topFiveProducts', () => {
		beforeEach(tu.populateTestDb);
		afterEach(tu.emptyTestDb);

		it('to be defined', () => {
			expect(queries.topFiveProducts).toBeDefined();
		});

		it('to return an array of five', async () => {
			// Arrange
			const p0 = {
				name: tu.PRODUCT_NAME,
				category_id: tu.CATEGORY_ID,
				price: tu.PRODUCT_PRICE,
			};
			const productStore = new ProductStore();
			const orderStore = new OrderStore();
			// Create products and add them to the cart
			const p1 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p1.id, 10);
			const p2 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p2.id, 15);
			await orderStore.addProduct(tu.ORDER_ID, <string>p2.id, 15);
			const p3 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p3.id, 11);
			const p4 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p4.id, 12);
			const p5 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p5.id, 20);
			const p6 = await productStore.create(p0);
			await orderStore.addProduct(tu.ORDER_ID, <string>p6.id, 5);

			// Act
			const result = await queries.topFiveProducts();

			// Assert
			expect(result.length).toEqual(5);
		});
	});
});
