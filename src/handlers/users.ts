import dotenv from 'dotenv';
import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {User, UserStore} from '../models/users';

dotenv.config();

const {
    DEFAULT_USER_AUTHLEVEL
} = process.env;

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
    try {
        const users = await store.index(res.locals.auth_level);
        res.json(users);
    } catch(err) {
        res.status(500);
        res.json(err);
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const user = await store.show(req.params.id, res.locals.auth_level);
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
            auth_level: req.body.auth_level,
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
            auth_level: req.body.auth_level,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password
        }
        const updatedUser = await store.update(user, res.locals.auth_level);
        res.json(updatedUser);
    } catch(err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedUser = await store.delete(req.params.id, res.locals.auth_level);
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

const register = async(req: Request, res: Response) => {
    try {
        const user: User = {
            id: '',
            auth_level: DEFAULT_USER_AUTHLEVEL as string,
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
}

// Reject attempts to create, modify or delete a user at a higher level than you
const noLeapFrog = (req: Request, res: Response, next: Function) => {
    try {
        if (res.locals.payload && req.body.auth_level >= res.locals.payload.auth_level) {
            // User is creating or modifying a user at the same or lower level
            next();
        }
    } catch(err) {
        res.status(401);
        next(err);
    }
}

const users_routes = (app: express.Application) => {
    app.get('/users', index);
    app.get('/users/:id', show);
    app.post('/users', verifyAuthToken(1, 2, 'id'), noLeapFrog, create);
    app.post('/users/register', register);
    app.put('/users/:id', verifyAuthToken(1, 2, 'id'), noLeapFrog, update);
    app.delete('/users/:id', verifyAuthToken(1, 2, 'id'), noLeapFrog, destroy);
    app.post('/users/authenticate', authenticate);
};

export default users_routes;