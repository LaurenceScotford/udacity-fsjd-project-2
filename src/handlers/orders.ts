import dotenv from 'dotenv';
import express, {Request, Response} from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {Order, OrderStore} from '../models/orders';

dotenv.config();

const {
    DEFAULT_USER_AUTHLEVEL
} = process.env;

const store = new OrderStore();

const index = async (_req: Request, res: Response) => {
    try {
        let user_id: string | null = null;
        if (res.locals.payload.auth_level == DEFAULT_USER_AUTHLEVEL) {
            user_id = res.locals.payload.user_id;
        }
        const orders = await store.index(user_id);
        res.json(orders);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const order = await store.show(req.params.id);
        res.json(order);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            id: '',
            user_id: req.body.user_id,
            status: req.body.status,
            products: req.body.products
        };
        const newOrder = await store.create(order);
        res.json(newOrder);
    } catch(err) {
        res.status(400);
        res.json(err);
    }  
};

const update = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            id: req.params.id,
            user_id: req.body.user_id,
            status: req.body.status,
            products: req.body.products
        }
        const updatedOrder = await store.update(order);
        res.json(updatedOrder);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedOrder = await store.delete(req.params.id);
        res.json(deletedOrder);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
}

const currentOrder = async (req: Request, res: Response) => {
    try {
        const order = await store.currentOrder(req.params.id);
        res.json(order);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
}

const completedOrders = async (req: Request, res: Response) => {
    try {
        const orders = await store.completedOrders(req.params.id);
        res.json(orders);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
}

const orders_routes = (app: express.Application) => {
    app.get('/orders', verifyAuthToken(1, 2, null), index);
    app.get('/orders/:id', verifyAuthToken(1, 2, 'user_id'), show);
    app.get('/open_order/:id', verifyAuthToken(0, 1, 'id'), currentOrder);
    app.get('/completed_orders/:id', verifyAuthToken(0, 1, 'id'), completedOrders);
    app.post('/orders', verifyAuthToken(0, 1, 'userid'), create);
    app.put('/orders', verifyAuthToken(0, 1, 'userid'), update);
    app.delete('/orders', verifyAuthToken(0, 1, 'userid'), destroy);
};

export default orders_routes;