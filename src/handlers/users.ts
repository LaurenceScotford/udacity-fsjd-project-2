import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {User, UserStore} from '../models/users';

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
    try {
        const users = await store.index();
        res.json(users);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const user = await store.show(req.params.id);
        res.json(user);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const user: User = {
            id: '',
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password
        };
        const newUser = await store.create(user);
        res.json(newUser);
    } catch(err) {
        res.status(400);
        res.json(err);
    }  
};

const update = async (req: Request, res: Response) => {
    try {
        const user: User = {
            id: req.params.id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password
        }
        const updatedUser = await store.update(user);
        res.json(updatedUser);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedUser = await store.delete(req.params.id);
        res.json(deletedUser);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
}

const authenticate = async (req: Request, res: Response) => {
    try {
        const authenticatedUser = await store.authenticate(req.body.username, req.body.password);
        const token = jwt.sign({user: authenticatedUser}, process.env.TOKEN_SECRET as string); 
        res.json(token);
    } catch(err) {
        res.status(401);
        res.json(err);
    }
}

const users_routes = (app: express.Application) => {
    console.log("Processing request");
    app.get('/users', index);
    app.get('/users/:id', show);
    app.post('/users', verifyAuthToken, create);
    app.put('/users/:id', verifyAuthToken, update);
    app.delete('/users/:id', verifyAuthToken, destroy);
    app.post('/users/authenticate', authenticate);
};

export default users_routes;