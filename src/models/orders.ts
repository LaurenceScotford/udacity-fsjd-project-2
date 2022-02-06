import db from '../database';

export type Order = {
    id: string;
    user_id: string;
    status: string;
};

export class OrderStore {
    async index(): Promise<Order[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM orders';
            const result = await conn.query(sql);
            conn.release();
            return result.rows 
        } catch (err) {
            throw new Error(`Could not get orders. Error: ${err}`)
        }
    }

    async show(id: string): Promise<Order> {
        try {
            const sql = 'SELECT * FROM orders WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find order ${id}. Error: ${err}`)
        }
      }

      async create(order: Order): Promise<Order> {
        try {
          const sql = 'INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [order.user_id, order.status]);
          const newOrder = result.rows[0];
          conn.release();
          return newOrder;
        } catch (err) {
            throw new Error(`Could not add new order for user_id ${order.user_id}. Error: ${err}`)
        }
    }
  
    async update(order: Order): Promise<Order> {
        try {
          const sql = 'UPDATE orders SET user_id = ($1), status = ($2) WHERE id = ($3) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [order.user_id, order.status, order.id]);
          const updatedOrder = result.rows[0];
          conn.release();
          return updatedOrder;
        } catch (err) {
            throw new Error(`Could not update order for user_id ${order.user_id}. Error: ${err}`)
        }
    }

    async delete(id: string): Promise<Order> {
        try {
          const sql = 'DELETE FROM orders WHERE id=($1)';
          const conn = await db.connect();
          const result = await conn.query(sql, [id]);
          const order = result.rows[0];
          conn.release();
          return order;
        } catch (err) {
            throw new Error(`Could not delete order ${id}. Error: ${err}`)
        }
    }
}