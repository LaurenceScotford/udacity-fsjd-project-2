import express, {Request, Response} from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {Category, CategoryStore} from '../models/categories';

const store = new CategoryStore();

const index = async (_req: Request, res: Response) => {
    try {
        const categories = await store.index();
        res.json(categories);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const category = await store.show(req.params.id);
        res.json(category);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const category: Category = {
            id: '',
            category: req.body.category
        };
        const newCategory = await store.create(category);
        res.json(newCategory);
    } catch(err) {
        res.status(400);
        res.json(err);
    }  
};

const update = async (req: Request, res: Response) => {
    try {
        const category: Category = {
            id: req.params.id,
            category: req.body.category
        }
        const updatedCategory = await store.update(category);
        res.json(updatedCategory);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedCategory = await store.delete(req.params.id);
        res.json(deletedCategory);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
}

const categories_routes = (app: express.Application) => {
    app.get('/categories', index);
    app.get('/categories/:id', show);
    app.post('/categories', verifyAuthToken, create);
    app.put('/categories/:id', verifyAuthToken, update);
    app.delete('/categories/:id', verifyAuthToken, destroy);
};

export default categories_routes;