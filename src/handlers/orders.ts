import express, {Request, Response} from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {Order, OrderStore} from '../models/orders';

const store = new OrderStore();

const index = async (_req: Request, res: Response) => {
    try {
        const orders = await store.index();
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
            status: req.body.status
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
            status: req.body.status
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

const orders_routes = (app: express.Application) => {
    app.get('/orders', index);
    app.get('/orders/:id', show);
    app.post('/orders', verifyAuthToken, create);
    app.put('/orders', verifyAuthToken, update);
    app.delete('/orders', verifyAuthToken, destroy);
};

export default orders_routes;