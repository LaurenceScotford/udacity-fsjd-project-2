import express, {Request, Response} from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import {Product, ProductStore} from '../models/products';

const store = new ProductStore();

const index = async (_req: Request, res: Response) => {
    try {
        const result = await store.index();
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(String(err));
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const result = await store.show(req.params.id);
        res.json(result);
    } catch(err) {
        res.status(500);
        res.send(String(err));
    }
};

const create = async (req: Request, res: Response) => {
    try {
        const product: Product = {
            id: '',
            name: req.body.name,
            price: req.body.price,
            url: req.body.url,
            description: req.body.description,
            category: req.body.category
        };
        const newProduct = await store.create(product);
        res.json(newProduct);
    } catch(err) {
        res.status(400);
        res.send(String(err));
    }  
};

const update = async (req: Request, res: Response) => {
    try {
        const product: Product = {
            id: req.params.id,
            name: req.body.name,
            price: req.body.price,
            url: req.body.url,
            description: req.body.description,
            category: req.body.category
        }
        const updatedProduct = await store.update(product);
        res.json(updatedProduct);
    } catch(err) {
        res.status(400);
        res.send(String(err));
    }
};

const destroy = async (req: Request, res: Response) => {
    try {
        const deletedProduct = await store.delete(req.params.id);
        res.json(deletedProduct);
    } catch(err) {
        res.status(400);
        res.send(String(err));
    }
}

const productsInCategory = async (req: Request, res: Response) => {
    try {
        const products = await store.productsByCategory(req.params.id);
        res.json(products);
    } catch(err) {
        res.status(400);
        res.send(String(err));
    }
}

const topProducts = async (req: Request, res: Response) => {
    try {
        const products = await store.topProducts(req.params.max);
        res.json(products);
    } catch(err) {
        res.status(400);
        res.send(String(err));
    }
}


const products_routes = (app: express.Application) => {
    app.get('/products', index);
    app.get('/products_in_category/:id', productsInCategory);
    app.get('/top_products/:max', topProducts);
    app.get('/products/:id', show);
    app.post('/products', verifyAuthToken(2, 2, null), create);
    app.put('/products/:id', verifyAuthToken(2, 2, null), update);
    app.delete('/products/:id', verifyAuthToken(2, 2, null), destroy);
};

export default products_routes;