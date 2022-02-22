import express, {Request, Response} from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {OrderProducts, OrderProductsStore} from '../models/order_products';

const store = new OrderProductsStore();

const index = async (_req: Request, res: Response) => {
    try {
        const orderProducts = await store.index();
        res.json(orderProducts);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const orderProducts = await store.show(req.params.id);
        res.json(orderProducts);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const orderProducts: OrderProducts = {
            id: '',
            order_id: req.body.order_id,
            product_id: req.body.order_id,
            quantity: req.body.quantity
        };
        const newOrderProducts = await store.create(orderProducts);
        res.json(newOrderProducts);
    } catch(err) {
        res.status(400);
        res.json(err);
    }  
};

const update = async (req: Request, res: Response) => {
    try {
        const orderProducts: OrderProducts = {
            id: req.params.id,
            order_id: req.body.order_id,
            product_id: req.body.order_id,
            quantity: req.body.quantity
        }
        const updatedOrderProducts = await store.update(orderProducts);
        res.json(updatedOrderProducts);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedOrderProducts = await store.delete(req.params.id);
        res.json(deletedOrderProducts);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
}

const order_products_routes = (app: express.Application) => {
    app.get('/order_products', index);
    app.get('/order_products/:id', show);
    app.post('/order_products', verifyAuthToken, create);
    app.put('/order_products/:id', verifyAuthToken, update);
    app.delete('/order_products/:id', verifyAuthToken, destroy);
};

export default order_products_routes;