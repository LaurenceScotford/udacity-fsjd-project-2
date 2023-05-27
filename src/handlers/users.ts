import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import { User, UserStore } from '../models/users';

const {
    DEFAULT_USER_AUTHLEVEL
} = process.env;

const EXPIRY_TIME = 86395000;

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
    try {
        const users = await store.index(res.locals.payload.user.auth_level);
        res.json(users);
    } catch (err) {
        res.status(500);
        res.send(String(err));
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const user = await store.show(req.params.id, res.locals.payload.user.auth_level);
        res.json(user);
    } catch (err) {
        res.status(500);
        res.send(String(err));
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
    } catch (err) {
        res.status(400);
        res.send(String(err));
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
        const updatedUser = await store.update(user, res.locals.payload.user.auth_level);
        res.json(updatedUser);
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedUser = await store.delete(req.params.id, res.locals.payload.user.auth_level);
        res.json(deletedUser);
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
}

const authenticate = async (req: Request, res: Response) => {
    try {
        const authenticatedUser = await store.authenticate(req.body.username, req.body.password);

        if (authenticatedUser) {
            const token = jwt.sign(
                {
                    user: {
                        id: authenticatedUser.id,
                        auth_level: authenticatedUser.auth_level
                    }
                },
                process.env.TOKEN_SECRET as string,
                { 'expiresIn': process.env.TOKEN_EXPIRY }
            );
            res.json({
                userId: authenticatedUser.id,
                idToken: token,
                expiresIn: EXPIRY_TIME
            });
        }

    } catch (err) {
        res.status(401);
        res.send(String(err));
    }
}

const register = async (req: Request, res: Response) => {
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
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
}

const checkUsername = async (req: Request, res: Response) => {
    try {
        const available = await store.checkUsername(req.body.username);
        res.json({
            username_available: available
        })
    } catch (err) {
        res.status(400);
        res.send(String(err));
    }
}

// Reject attempts to create, modify or delete a user at a higher level than you
const noLeapFrog = (req: Request, res: Response, next: Function) => {
    try {
        if (!req.body.auth_level || (res.locals.payload && req.body.auth_level <= res.locals.payload.user.auth_level)) {
            // User is creating or modifying a user at the same or lower level
            next();
        } else {
            throw new Error('You are not permitted to run user operations on a user at a higher authorisation level than you');
        }
    } catch (err) {
        next(err);
    }
}

const users_routes = (app: express.Application) => {
    app.get('/users', verifyAuthToken(1, 2, 'id'), index);
    app.get('/users/:id', verifyAuthToken(1, 2, 'id'), show);
    app.post('/users/checkusername', checkUsername);
    app.post('/users/register', register);
    app.post('/users', verifyAuthToken(1, 2, 'id'), noLeapFrog, create);
    app.put('/users/:id', verifyAuthToken(1, 2, 'id'), noLeapFrog, update);
    app.delete('/users/:id', verifyAuthToken(1, 2, 'id'), noLeapFrog, destroy);
    app.post('/users/authenticate', authenticate);
};

export default users_routes;