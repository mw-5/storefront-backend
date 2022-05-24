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

/**
 * @description Handle request to mark order as completed.
 * @param req - The incoming request
 * @param res - The response send
 */
const complete = async (req: Request, res: Response): Promise<void> => {
	try {
		const orderId = req.params.id;
		const order = await store.complete(orderId);
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
	app.put('/orders/:id/complete', complete);
};

export default orderRoutes;
