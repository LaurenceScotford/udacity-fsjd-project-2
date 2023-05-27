import db from '../database';

export type Product = {
    id: string;
    name: string;
    price: number | string;
    url: string,
    description: string,
    category: string;
};

export type TopProduct = {
    id: string;
    name: string;
    price: number | string;
    category: string;
    url: string;
    description: string;
    quantity: number;
}

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM products';
            const result = await conn.query(sql);
            conn.release();
            let products = result.rows;
            products = products.map(el => this.#priceToNum(el));
            return products;
        } catch (err) {
            throw new Error(`Could not get products. ${err}`)
        }
    }

    async show(id: string): Promise<Product> {
        try {
            const sql = 'SELECT * FROM products WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            let product = result.rows[0];
            return this.#priceToNum(product);
        } catch (err) {
            throw new Error(`Could not find product ${id}. ${err}`)
        }
    }

    async create(prod: Product): Promise<Product> {
        try {
            const sql = 'INSERT INTO products (name, price, url, description, category) VALUES($1, $2, $3, $4, $5) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [prod.name, prod.price, prod.url, prod.description, prod.category]);
            const product = result.rows[0];
            conn.release();
            return this.#priceToNum(product);
        } catch (err) {
            throw new Error(`Could not add new product ${prod.name}. ${err}`)
        }
    }

    async update(prod: Product): Promise<Product> {
        try {
            // Scan parameter for properties to be updated
            let argCount = 1;
            let argList = [];
            let sql = 'UPDATE products SET';
            type argType = 'name' | 'price' | 'url' | 'description' | 'category';
            let args: argType[] = ['name', 'price', 'url', 'description', 'category'];
            for (let i = 0; i < args.length; i++) {
                const prop: argType = args[i];
                if (prod[prop]) {
                    sql += (argCount > 1 ? ', ' : ' ');
                    sql += `${prop} = ($${argCount++})`;
                    argList.push(prod[prop]);
                }
            }

            // If at least one property has been updated, do the update
            if (argList.length) {
                argList.push(prod.id);
                sql += ` WHERE id = ($${argCount}) RETURNING *`;
                const conn = await db.connect();
                const result = await conn.query(sql, argList);
                const product = result.rows[0];
                conn.release();
                return this.#priceToNum(product);
            } else {
                throw new Error('No properties were passed in to update');
            }
        } catch (err) {
            throw new Error(`Could not update product ${prod.name}. ${err}`)
        }
    }

    async delete(id: string): Promise<Product> {
        try {
            const sql = 'DELETE FROM products WHERE id=($1) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            const product = result.rows[0];
            conn.release();
            return this.#priceToNum(product);
        } catch (err) {
            throw new Error(`Could not delete product ${id}. ${err}`)
        }
    }

    async productsByCategory(id: string): Promise<Product[]> {
        try {
            const sql = 'SELECT * FROM products WHERE category = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            let products = result.rows;
            products = products.map(el => this.#priceToNum(el));
            return products;
        } catch (err) {
            throw new Error(`Could not get products for category_id: ${id}. ${err}`)
        }
    }

    async topProducts(numToShow: number | string): Promise<Product[]> {
        try {
            // Get a list of products sold and quantities
            const conn = await db.connect();
            const listSql = 'SELECT product_id, quantity FROM order_products WHERE order_id IN (SELECT id AS order_id FROM orders WHERE status = \'complete\')';
            const result = await conn.query(listSql);
            const products: { [key: string]: number } = {};
            for (let i = 0; i < result.rows.length; i++) {
                const id = result.rows[i].product_id;
                const quantity = result.rows[i].quantity;
                // If a product has already been added, update the quantity ...
                if (products[id]) {
                    products[id] += quantity;
                } else {
                    // ... otherwise create a new entry with an initial quantity
                    products[id] = quantity;
                }
            }

            // Sort the products by quantity
            const sortList: { id: string, quantity: number }[] = [];
            for (let product in products) {
                sortList.push({ id: product, quantity: products[product] });
            }

            sortList.sort((a, b) => {
                return Math.sign(a.quantity - b.quantity);
            });

            // Now get a list of products and quantities
            const topList: TopProduct[] = []
            const num = numToShow as number;
            for (let i = 0; i < (sortList.length < num ? sortList.length : num); i++) {
                const sql = 'SELECT * FROM products WHERE id = ($1)';
                const result = await conn.query(sql, [sortList[i].id]);
                const prod = result.rows[0];
                topList.push({
                    id: prod.id,
                    name: prod.name,
                    price: prod.price,
                    url: prod.url,
                    description: prod.description,
                    category: prod.category,
                    quantity: sortList[i].quantity
                });
            }

            conn.release();
            return topList;
        } catch (err) {
            throw new Error(`Could not get the list of top products. Err${err}`);
        }
    }

    // Convert the price property to a numeric value so it can be used in math operations 
    #priceToNum(product: Product) {
        if (product) {
            product.price = parseFloat(product.price as string);
        }
        return product;
    }
}