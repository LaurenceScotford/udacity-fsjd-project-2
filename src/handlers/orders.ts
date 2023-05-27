import express, { Request, Response } from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import { Order, OrderStore } from '../models/orders';

const {
    DEFAULT_USER_AUTHLEVEL
} = process.env;

const store = new OrderStore();

const index = async (_req: Request, res: Response) => {
    try {
        let user_id: string | null = null;
        if (res.locals.payload.user.auth_level == DEFAULT_USER_AUTHLEVEL) {
            user_id = res.locals.payload.user.id;
        }
        const orders = await store.index(user_id);
        res.json(orders);
    } catch (err) {
        res.status(500);
        res.send(String(err));
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const order = await store.show(req.params.id, res.locals.payload);
        res.json(order);
    } catch (err) {
        res.status(500);
        res.send(String(err));
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            id: '',
            user_id: req.body.user_id,
            recipient_name: req.body.recipient_name,
            delivery_address: req.body.delivery_address,
            date_time: null,
            status: req.body.status,
            products: req.body.products
        };
        const newOrder = await store.create(order);
        res.json(newOrder);
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
};

const update = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            id: req.params.id,
            user_id: req.body.user_id,
            recipient_name: req.body.recipient_name,
            delivery_address: req.body.delivery_address,
            date_time: null,
            status: req.body.status,
            products: req.body.products
        }
        const updatedOrder = await store.update(order, res.locals.payload);
        res.json(updatedOrder);
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedOrder = await store.delete(req.params.id, res.locals.payload);
        res.json(deletedOrder);
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
}

const currentOrders = async (req: Request, res: Response) => {
    try {
        const order = await store.currentOrders(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(500);
        res.send(String(err));
    }
}

const completedOrders = async (req: Request, res: Response) => {
    try {
        const orders = await store.completedOrders(req.params.id);
        res.json(orders);
    } catch (err) {
        res.status(500);
        res.send(String(err));
    }
}

const orders_routes = (app: express.Application) => {
    app.get('/orders', verifyAuthToken(1, 2, null), index);
    app.get('/orders/:id', verifyAuthToken(1, 2, null), show);
    app.get('/open_orders/:id', verifyAuthToken(1, 2, 'id'), currentOrders);
    app.get('/completed_orders/:id', verifyAuthToken(1, 2, 'id'), completedOrders);
    app.post('/orders', verifyAuthToken(1, 2, 'userid'), create);
    app.put('/orders/:id', verifyAuthToken(1, 2, null), update);
    app.delete('/orders/:id', verifyAuthToken(1, 2, null), destroy);
};

export default orders_routes;