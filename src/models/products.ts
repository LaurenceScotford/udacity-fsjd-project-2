import db from '../database';

export type Product = {
    id: string;
    name: string;
    price: string;
    category: string; 
};

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM products';
            const result = await conn.query(sql);
            conn.release();
            return result.rows 
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
            return result.rows[0];
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
          return product;
        } catch (err) {
            throw new Error(`Could not add new product ${prod.name}. Error: ${err}`)
        }
    }
  
    async update(prod: Product): Promise<Product> {
        try {
          const sql = 'UPDATE products SET name = ($1), price = ($2), category = ($3) WHERE id = ($4) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [prod.name, prod.price, prod.category, prod.id]);
          const product = result.rows[0];
          conn.release();
          return product;
        } catch (err) {
            throw new Error(`Could not update product ${prod.name}. Error: ${err}`)
        }
    }

    async delete(id: string): Promise<Product> {
        try {
          const sql = 'DELETE FROM products WHERE id=($1)';
          const conn = await db.connect();
          const result = await conn.query(sql, [id]);
          const product = result.rows[0];
          conn.release();
          return product;
        } catch (err) {
            throw new Error(`Could not delete product ${id}. Error: ${err}`)
        }
    }
}