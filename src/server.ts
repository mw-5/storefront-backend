import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import productsRoutes from './handlers/products';
import categoryRoutes from './handlers/categories';
import usersRoutes from './handlers/users';
import ordersRoutes from './handlers/orders';
import reportsRoutes from './handlers/reports';

const app: express.Application = express();
const address = '0.0.0.0:3000';

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req: Request, res: Response) {
	res.send('Hello World!');
});

productsRoutes(app);
categoryRoutes(app);
usersRoutes(app);
ordersRoutes(app);
reportsRoutes(app);

app.listen(3000, function () {
	console.log(`starting app on: ${address}`);
});

export default app;
