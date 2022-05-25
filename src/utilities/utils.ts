import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user';

dotenv.config();

/**
 * @description Verify JWT and return user id from its payload
 * or null if user is unauthorized.
 * @param authHeader - The authorization header from the request
 * @returns - The user id or null if user is unauthorized
 */
export const verifyUser = (authHeader: string): string | null => {
	try {
		// Extract JWT
		const token = authHeader.split(' ')[1];

		// Verify JWT and get payload
		const payload = <JwtPayload>(
			jwt.verify(token, <string>process.env.SECRET_TOKEN)
		);

		// Extract user from payload
		const user = <User>payload.user;

		return user.id;
	} catch (err) {
		return null;
	}
};
