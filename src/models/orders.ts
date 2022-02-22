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
                // Scan parameter for properties to be updated
                let argCount = 1;
                let argList = []; 
                let sql = 'UPDATE orders SET';
                type argType = 'user_id' | 'status';
                let args: argType[] = ['user_id', 'status'];
                for (let i = 0; i < args.length; i++) {
                    const prop: argType = args[i];
                    if(order[prop]) {
                        sql += (argCount > 1 ? ', ' : ' ');
                        sql += `${prop} = ($${argCount++})`;
                        argList.push(order[prop]);
                    }
                }
      
                // If at least one property has been updated, do the update
                if (argList.length) {
                    argList.push(order.id);
                    sql += ` WHERE id = ($${argCount}) RETURNING *`;
                    const conn = await db.connect();
                    const result = await conn.query(sql, argList);
                    const updatedOrder = result.rows[0];
                    conn.release();
                    return updatedOrder;
                } else {
                    throw new Error('No properties were passed in to update');
                }
        } catch (err) {
            throw new Error(`Could not update order for user_id ${order.user_id}. Error: ${err}`)
        }
    }

    async delete(id: string): Promise<Order> {
        try {
            const sql = 'DELETE FROM orders WHERE id=($1) RETURNING *';
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