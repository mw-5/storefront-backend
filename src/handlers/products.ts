import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';

const store = new ProductStore();

// Handlers

/**
 * @description Handle create request for product.
 * @param req - The incoming request
 * @param res - The response send
 * @returns - The created product
 */
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const product: Product = {
			name: req.body.name,
			price: req.body.price,
			category_id: req.body.category_id,
		};
		const newProduct = await store.create(product);
		res.json(newProduct);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

const index = async (_: Request, res: Response): Promise<void> => {
	try {
		const products = await store.index();
		res.json(products);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
};

// Endpoints

/**
 * @description Set up endpoints to handle requests for products.
 * @param app - The express application
 */
const productRoutes = (app: express.Application): void => {
	app.post('/products', create);
	app.get('/products', index);
};

export default productRoutes;
