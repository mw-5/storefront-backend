import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @description Verify the JWT.
 * @param req - The incomming request
 * @param res - The response send
 * @param next - Forwards request
 * to next middleware or endpoint
 */
const verifyJwt = async (req: Request, res: Response, next: () => void) => {
	try {
		// Extract JWT from authorization header
		const authHeader = <string>req.headers.authorization;
		const token = authHeader.split(' ')[1];

		// Verify JWT
		jwt.verify(token, <string>process.env.SECRET_TOKEN);

		// Forward request
		next();
	} catch (err) {
		res.status(401);
		res.json('Unauthorized');
	}
};

export default verifyJwt;
