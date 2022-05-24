import express, { Request, Response } from 'express';
import { OrderStore } from '../../src/models/order';

const store = new OrderStore();

// Handlers

/**
 * @description Handle request to create order.
 * @param req - The incoming request
 * @param res - The response send
 */
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.body.userId;
		const order = await store.create(userId);
		res.json(order);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

// Endpoints

/**
 * @description Set up endpoints to handle requests for orders.
 * @param app - The express application
 */
const orderRoutes = (app: express.Application): void => {
	app.post('/orders', create);
};

export default orderRoutes;
