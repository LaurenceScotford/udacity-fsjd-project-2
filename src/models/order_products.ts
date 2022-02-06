import db from '../database';

export type OrderProducts = {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number; 
};

export class OrderProductsStore {
    async index(): Promise<OrderProducts[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM order_products';
            const result = await conn.query(sql);
            conn.release();
            return result.rows 
        } catch (err) {
            throw new Error(`Could not get order_products. Error: ${err}`)
        }
    }

    async show(id: string): Promise<OrderProducts> {
        try {
            const sql = 'SELECT * FROM order_products WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find order_products ${id}. Error: ${err}`)
        }
      }

      async create(orderProducts: OrderProducts): Promise<OrderProducts> {
        try {
          const sql = 'INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [orderProducts.order_id, orderProducts.product_id, orderProducts.quantity]);
          const ordProds = result.rows[0];
          conn.release();
          return ordProds;
        } catch (err) {
            throw new Error(`Could not add new order_products for order_id ${orderProducts.order_id} and product_id ${orderProducts.product_id}. Error: ${err}`)
        }
    }
  
    async update(orderProducts: OrderProducts): Promise<OrderProducts> {
        try {
          const sql = 'UPDATE order_products SET order_id = ($1), product_id = ($2), quantity = ($3) WHERE id = ($4) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [orderProducts.order_id, orderProducts.product_id, orderProducts.quantity, orderProducts.id]);
          const ordProds = result.rows[0];
          conn.release();
          return ordProds;
        } catch (err) {
            throw new Error(`Could not update order_products for order_id ${orderProducts.order_id} and product_id ${orderProducts.product_id}. Error: ${err}`)
        }
    }

    async delete(id: string): Promise<OrderProducts> {
        try {
          const sql = 'DELETE FROM order_products WHERE id=($1)';
          const conn = await db.connect();
          const result = await conn.query(sql, [id]);
          const ordProds = result.rows[0];
          conn.release();
          return ordProds;
        } catch (err) {
            throw new Error(`Could not delete product ${id}. Error: ${err}`)
        }
    }
}