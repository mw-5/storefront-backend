import express, { Request, Response } from 'express';
import { UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyJwt from '../middleware/authentication';

dotenv.config();

const store = new UserStore();

// Handlers

/**
 * @description Handle create request for user.
 * @param req - The incoming request
 * @param res - The response send
 */
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		// Extract user from request
		const user = {
			id: req.body.id,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			password: req.body.password,
			password_digest: '',
		};

		// Create new user
		const newUser = await store.create(user);

		// Create token for user
		const token = jwt.sign(
			{ user: newUser },
			process.env.SECRET_TOKEN as string
		);

		// Send token
		res.json(token);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle authentication of user request.
 * @param req - The incoming request
 * @param res - The response send
 */
const authenticate = async (req: Request, res: Response): Promise<void> => {
	try {
		// Extract arguments from request
		const userId = req.body.id;
		const password = req.body.password;

		// Authenticate user
		const resultUser = await store.authenticate(userId, password);
		if (resultUser === null) {
			throw new Error(`User ${userId} is not authorized`);
		}

		// Create JWT
		const token = jwt.sign(
			{ user: resultUser },
			process.env.SECRET_TOKEN as string
		);

		// Send response
		res.json(token);
	} catch (err) {
		res.status(401);
		res.json(err);
	}
};

/**
 * @description Handle index request for users.
 * @param _
 * @param res - The response send
 */
const index = async (_: Request, res: Response): Promise<void> => {
	try {
		const users = await store.index();
		res.json(users);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

/**
 * @description Handle show user request.
 * @param req - The incoming request
 * @param res - The response send
 */
const show = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.id;
		const user = await store.show(userId);
		res.json(user);
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
	app.post('/users/login', authenticate);
	app.get('/users', verifyJwt, index);
	app.get('/users/:id', verifyJwt, show);
};

export default userRoutes;
