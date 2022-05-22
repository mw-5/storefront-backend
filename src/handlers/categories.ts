import express, { Request, Response } from 'express';
import { CategoryStore } from '../models/category';

const store = new CategoryStore();

// Handlers

/**
 * @description Handle create request for category.
 * @param req - The incoming request
 * @param res - The response send
 */
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const category = {
			id: undefined,
			name: req.body.name,
		};
		const newCategory = await store.create(category);
		res.json(newCategory);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

// Endpoints

/**
 * @description Set up endpoints to handle requests for categories.
 * @param app - The express application
 */
const categoryRoutes = (app: express.Application): void => {
	app.post('/categories', create);
};

export default categoryRoutes;
