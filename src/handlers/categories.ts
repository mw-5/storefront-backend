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

/**
 * @description Handle index request for categories.
 * @param req - The incoming request
 * @param res - The response send
 */
const index = async (_: Request, res: Response): Promise<void> => {
	try {
		const categories = await store.index();
		res.json(categories);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle show request for categories.
 * @param req - The incoming request
 * @param res - The response send
 */
const show = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		const category = await store.show(id);
		res.json(category);
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
	app.get('/categories', index);
	app.get('/categories/:id', show);
};

export default categoryRoutes;
