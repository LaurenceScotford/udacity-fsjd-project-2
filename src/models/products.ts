import db from '../database';

export type Product = {
    id: string;
    name: string;
    price: number | string;
    category: string; 
};

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
            throw new Error(`Could not get products. Error: ${err}`)
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
            throw new Error(`Could not find product ${id}. Error: ${err}`)
        }
      }

      async create(prod: Product): Promise<Product> {
        try {
            const sql = 'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [prod.name, prod.price, prod.category]);
            const product = result.rows[0];
            conn.release();
            return this.#priceToNum(product);
        } catch (err) {
            throw new Error(`Could not add new product ${prod.name}. Error: ${err}`)
        }
    }
  
    async update(prod: Product): Promise<Product> {
        try {
            // Scan parameter for properties to be updated
            let argCount = 1;
            let argList = []; 
            let sql = 'UPDATE products SET';
            type argType = 'name' | 'price' | 'category';
            let args: argType[] = ['name', 'price', 'category'];
            for (let i = 0; i < args.length; i++) {
                const prop: argType = args[i];
                if(prod[prop]) {
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
            throw new Error(`Could not update product ${prod.name}. Error: ${err}`)
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
            throw new Error(`Could not delete product ${id}. Error: ${err}`)
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