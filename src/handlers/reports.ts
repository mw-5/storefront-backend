import express, { Request, Response } from 'express';
import { ReportQueries } from '../services/report';

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
		const userId = req.params.id;
		const order = await queries.currentOrderByUser(userId);
		res.json(order);
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
};

export default reportRoutes;