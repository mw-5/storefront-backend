import express, { Request, Response } from 'express';
import { ReportQueries } from '../services/report';
import { verifyUser } from '../utilities/utils';

const queries = new ReportQueries();

// Handlers

/**
 * @description Handle request for current active order by user.
 * @param req - The incoming request
 * @param res - The response send
 */
const currentOrderByUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Extract args
		const userId = req.params.id;

		// Verify user
		const tokenUserId = verifyUser(<string>req.headers.authorization);
		if (tokenUserId === null || userId !== tokenUserId) {
			res.status(401);
			res.json(`User ${tokenUserId} is unauthorized`);
			return;
		}

		const order = await queries.currentOrderByUser(userId);
		res.json(order);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle request for completed orders by user.
 * @param req - The incoming request
 * @param res - The response send
 */
const completedOrdersByUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Extract args
		const userId = req.params.id;

		// Verify user
		const tokenUserId = verifyUser(<string>req.headers.authorization);
		if (tokenUserId === null || userId !== tokenUserId) {
			res.status(401);
			res.json(`User ${tokenUserId} is unauthorized`);
			return;
		}

		// Send orders
		const orders = await queries.completedOrdersByUser(userId);
		res.json(orders);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle request for products by category.
 * @param req - The incoming request
 * @param res - The response send
 */
const productsByCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const categoryId = req.params.id;
		const categories = await queries.productsByCategory(categoryId);
		res.json(categories);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle request for top five products.
 * @param _
 * @param res - The response send
 */
const topFiveProducts = async (_: Request, res: Response): Promise<void> => {
	try {
		const result = await queries.topFiveProducts();
		res.json(result);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

// Endpoints

/**
 * @description Set up endpoints to handle requests for reports.
 * @param app - The express application
 */
const reportRoutes = (app: express.Application): void => {
	app.get('/users/:id/current_order', currentOrderByUser);
	app.get('/users/:id/completed_orders', completedOrdersByUser);
	app.get('/categories/:id/products', productsByCategory);
	app.get('/top_5_popular_products', topFiveProducts);
};

export default reportRoutes;
