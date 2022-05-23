import express, { Request, Response } from 'express';
import { UserStore } from '../models/user';

const store = new UserStore();

// Handlers

/**
 * @description Handle create request for user.
 * @param req - The incoming request
 * @param res - The response send
 */
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = {
			id: req.body.id,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			password: req.body.password,
			password_digest: '',
		};
		const newUser = await store.create(user);
		res.json(newUser);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

// Endpoints

/**
 * @description Set up endpoint to handle requests for users.
 * @param app - The express application
 */
const userRoutes = (app: express.Application): void => {
	app.post('/users', create);
};

export default userRoutes;
