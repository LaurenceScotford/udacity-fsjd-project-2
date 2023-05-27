import express, { Request, Response } from 'express';
import cors from 'cors';

import categories_routes from './handlers/categories';
import products_routes from './handlers/products';
import users_routes from './handlers/users';
import orders_routes from './handlers/orders';

const {
    API_HOST,
    API_PORT,
} = process.env;

const app: express.Application = express()

const address = `${API_HOST}:${API_PORT}`;

app.use(express.json());

app.use(express.static(__dirname + '/public'));

app.use(cors());

categories_routes(app);
products_routes(app);
users_routes(app);
orders_routes(app);

app.listen(API_PORT, function () {
    console.log(`starting app on: ${address}`)
});
