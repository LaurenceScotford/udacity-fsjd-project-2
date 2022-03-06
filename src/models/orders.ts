import db from '../database';

type OrderProducts = {
    product_id: string;
    quantity: number;
}

export type Order = {
    id: string;
    user_id: string;
    status: string;
    products: OrderProducts[]
};

export class OrderStore {
    
    async index(user_id: string | null): Promise<Order[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM orders';
            const result = await conn.query(sql);
            conn.release();
            let orders: Order[] = [];
            for (let i = 0; i < result.rows.length; i++) {
                // If we're listing orders for a specific user, filter out orders that are not owned by that user
                if (!user_id || user_id == result.rows[i].user_id) {
                    orders[i] = {
                        id: result.rows[i].id,
                        user_id: result.rows[i].user_id,
                        status: result.rows[i].status,
                        products: await this.#getProductList(result.rows[i].id)
                    }
                } 
            } 
            return orders; 
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

            if (result.rows[0]) {
                const order: Order = {
                    id: result.rows[0].id,
                    user_id: result.rows[0].user_id,
                    status: result.rows[0].status,
                    products: await this.#getProductList(result.rows[0].id)
                }
                return order;
            } else {
                return result.rows[0];
            }
            
        } catch (err) {
            throw new Error(`Could not find order ${id}. Error: ${err}`)
        }
      }

      async create(order: Order): Promise<Order> {
        try {
            // Check that a new current order is not being opened for a user who already has an open order
            if (order.status === 'active' && await this.currentOrder(order.user_id)) {
                throw new Error('A user can only have a single active order');
            }

            const sql = 'INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [order.user_id, order.status]);
            conn.release();
            await this.#setProductList(result.rows[0].id, order.products);

            const newOrder: Order = {
                id: result.rows[0].id,
                user_id: result.rows[0].user_id,
                status: result.rows[0].status,
                products: await this.#getProductList(result.rows[0].id)
            }

            return newOrder;
        } catch (err) {
            throw new Error(`Could not add new order for user_id ${order.user_id}. Error: ${err}`)
        }
    }
  
    async update(order: Order): Promise<Order> {
        try {
                // If the order status is being set to active, check that there is not already a
                // different active order for this user
                if (order.status === 'active') {
                    const activeOrder = await this.currentOrder(order.user_id);
                    if (activeOrder && activeOrder.id !== order.id ) {
                        throw new Error('A user can only have a single active order');
                    }
                }

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
      
                let updatedOrder : Order;

                // If at least one property has been updated, do the update
                if (argList.length) {
                    argList.push(order.id);
                    sql += ` WHERE id = ($${argCount}) RETURNING *`;
                    const conn = await db.connect();
                    const result = await conn.query(sql, argList);
                    updatedOrder = result.rows[0];
                    conn.release();
                } else {
                    updatedOrder = await this.show(order.id);
                }

                // If the product list has been updated, amend the entries in the order_products table
                if (order.products.length) {
                    // First remove all existing entries
                    await this.#deleteProductList(order.id);

                    // Now set the revised product list
                    await this.#setProductList(order.id, order.products);
                }
                
                // If something has been updated, return the updated order
                if (argList.length || order.products.length) {
                    updatedOrder.products = await this.#getProductList(order.id);
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
            // First delete orderProducts entries for this order
            const productsDeleted = await this.#getProductList(id);
            await this.#deleteProductList(id);
            const sql = 'DELETE FROM orders WHERE id=($1) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            const order = result.rows[0];
            conn.release();
            order.products = productsDeleted;
            return order;
        } catch (err) {
            throw new Error(`Could not delete order ${id}. Error: ${err}`)
        }
    }

    async currentOrder(id: string): Promise<Order> {
        try {
            const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=\'active\'';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            if (result.rows[0]) {
                const order: Order = {
                    id: result.rows[0].id,
                    user_id: result.rows[0].user_id,
                    status: result.rows[0].status,
                    products: await this.#getProductList(result.rows[0].id)
                }
                return order;
            } else {
                return result.rows[0];
            }
            
        } catch (err) {
            throw new Error(`Could not get current order for user_id ${id}. Error: ${err}`)
        }
    }

    async completedOrders(id: string): Promise<Order[]> {
        try {
            const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=\'complete\'';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            let orders: Order[] = [];
            for (let i = 0; i < result.rows.length; i++) {
                orders[i] = {
                    id: result.rows[i].id,
                    user_id: result.rows[i].user_id,
                    status: result.rows[i].status,
                    products: await this.#getProductList(result.rows[i].id)
                }
            } 
            return orders;
            
        } catch (err) {
            throw new Error(`Could not get current order for user_id ${id}. Error: ${err}`)
        }
    }

    // Gets a list of products and quantities associated with this order
    async #getProductList(order: string) : Promise<OrderProducts[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM order_products WHERE order_id = ($1)';
            const result = await conn.query(sql, [order]);
            conn.release();
            const products : OrderProducts[] = [];
            for(var i = 0; i < result.rows.length; i++) {
                products[i] = {
                    product_id: result.rows[i].product_id, 
                    quantity: result.rows[i].quantity
                };
            }
            return products; 
        } catch (err) {
            throw new Error(`Could not get order_products. Error: ${err}`)
        }
    }

    // Creates the products and quantities associated with this order
    async #setProductList(order: string, products: OrderProducts[]) {
        for (let i = 0; i < products.length; i++) {
            // Check if this product is already listed for this order
            let existing;
            try {
                const sql = 'SELECT id, quantity FROM order_products WHERE order_id = ($1) AND product_id = ($2)';
                const conn = await db.connect();
                const result = await conn.query(sql, [order, products[i].product_id]);
                conn.release();
                existing = result.rows[0];
            } catch (err) {
                throw new Error(`Could not find order_products for order_id ${order}. Error: ${err}`)
            }

            // If an existing listing is found then update the quantity for the existing listing
            if (existing) {
                try {
                    const sql = 'UPDATE order_products SET quantity = ($1) WHERE id = ($2)';
                    const conn = await db.connect();
                    const result = await conn.query(sql, [existing.quantity + products[i].quantity, existing.id]);
                    conn.release();
                } catch (err) {
                    throw new Error(`Could not find order_products for order_id ${order}. Error: ${err}`)
                }
            } else {    // Otherwise create a new entry for that product
                try {
                    const sql = 'INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *';
                    const conn = await db.connect();
                    const result = await conn.query(sql, [order, products[i].product_id, products[i].quantity]);
                    conn.release();
                } catch (err) {
                    throw new Error(`Could not add new order_products for order_id ${order} and product_id ${products[i].product_id}. Error: ${err}`)
                }
            }
        }
    }

    // Deletes a list of products for a given order
    async #deleteProductList(order: string) : Promise<void> {
        const orderProducts = await this.#getProductList(order);

        try {
            for (var i = 0; i < orderProducts.length; i++) {
                const sql = 'DELETE FROM order_products WHERE order_id=($1)';
                const conn = await db.connect();
                await conn.query(sql, [order]);
            }
        } catch (err) {
                    throw new Error(`Could not add del;ete order_products for order_id ${order}. Error: ${err}`)
        }
    }
}