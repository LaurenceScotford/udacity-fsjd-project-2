import { QueryResult } from 'pg'

import db from '../database';
import { TokenInterface } from '../middleware/verifyAuthToken';

type OrderProducts = {
    product_id: string;
    quantity: number;
}

export type Order = {
    id: string;
    user_id: string;
    recipient_name: string;
    delivery_address: string;
    date_time: number | null;
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
            return this.resultToOrdersArray(result, user_id);
        } catch (err) {
            throw new Error(`Could not get orders. ${err}`)
        }
    }

    async show(id: string, payload: TokenInterface | null): Promise<Order> {
        try {
            const sql = 'SELECT * FROM orders WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();

            if (result.rows[0]) {

                // Check for attempt to display an order not owned
                if (payload && payload.user.own) {
                    if (result.rows[0].user_id != payload.user.id) {
                        throw new Error('You are not authorised to access orders that you don\'t own');
                    }
                }

                const order: Order = {
                    id: result.rows[0].id,
                    user_id: result.rows[0].user_id,
                    recipient_name: result.rows[0].recipient_name,
                    delivery_address: result.rows[0].delivery_address,
                    date_time: result.rows[0].date_time,
                    status: result.rows[0].status,
                    products: await this.#getProductList(result.rows[0].id)
                }
                return order;
            } else {
                return result.rows[0];
            }

        } catch (err) {
            throw new Error(`Could not find order ${id}. ${err}`)
        }
    }

    async create(order: Order): Promise<Order> {
        try {
            const sql = 'INSERT INTO orders (user_id, recipient_name, delivery_address, date_time, status) VALUES($1, $2, $3, $4, $5) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [order.user_id, order.recipient_name, order.delivery_address, Date.now(), order.status]);
            conn.release();
            await this.#setProductList(result.rows[0].id, order.products);

            const newOrder: Order = {
                id: result.rows[0].id,
                user_id: result.rows[0].user_id,
                recipient_name: result.rows[0].recipient_name,
                delivery_address: result.rows[0].delivery_address,
                date_time: result.rows[0].date_time,
                status: result.rows[0].status,
                products: await this.#getProductList(result.rows[0].id)
            }

            return newOrder;
        } catch (err) {
            throw new Error(`Could not add new order for user_id ${order.user_id}. ${err}`)
        }
    }

    async update(order: Order, payload: TokenInterface | null): Promise<Order> {
        try {
            // Check for attempt to update order not owned
            if (payload && payload.user.own) {
                let currentOrder = await this.show(order.id, null);
                if (currentOrder.user_id != payload.user.id) {
                    throw new Error('You are not authorised to modify orders that you don\'t own');
                }
            }

            // If the order status is being set to active, check that there is not already a
            // different active order for this user
            // if (order.status === 'active') {
            //     const activeOrder = await this.currentOrder(order.user_id);
            //     if (activeOrder && activeOrder.id !== order.id) {
            //         throw new Error('A user can only have a single active order');
            //     }
            // }

            // Scan parameter for properties to be updated
            let argCount = 1;
            let argList = [];
            let sql = 'UPDATE orders SET';
            type argType = 'user_id' | 'recipient_name' | 'delivery_address' | 'status';
            let args: argType[] = ['user_id', 'recipient_name', 'delivery_address', 'status'];
            for (let i = 0; i < args.length; i++) {
                const prop: argType = args[i];
                if (order[prop]) {
                    sql += (argCount > 1 ? ', ' : ' ');
                    sql += `${prop} = ($${argCount++})`;
                    argList.push(order[prop]);
                }
            }

            let updatedOrder: Order;
            let wasUpdated: Boolean = ((argList.length > 0) || (order.products && order.products.length > 0));

            // If at least one property has been updated, do the update
            if (argList.length) {
                argList.push(order.id);
                sql += `, date_time = ${Date.now()} WHERE id = ($${argCount}) RETURNING *`;

            } else if (order.products && order.products.length) {
                // The products only have been updated, so just update the timestamp here
                argList = [order.id];
                sql = `UPDATE orders SET date_time = ${Date.now()} WHERE id = ($1) RETURNING *`
            }

            // If there's been any change, write the new record
            if (wasUpdated) {
                const conn = await db.connect();
                const result = await conn.query(sql, argList);
                updatedOrder = result.rows[0];
                conn.release();
            } else {
                updatedOrder = await this.show(order.id, null);
            }

            // If the product list has been updated, amend the entries in the order_products table
            if (order.products && order.products.length) {
                // First remove all existing entries
                await this.#deleteProductList(order.id);

                // Now set the revised product list
                await this.#setProductList(order.id, order.products);
            }

            // If something has been updated, return the updated order
            if (argList.length || (order.products && order.products.length)) {
                updatedOrder.products = await this.#getProductList(order.id);
                return updatedOrder;
            } else {
                throw new Error('No properties were passed in to update');
            }
        } catch (err) {
            throw new Error(`Could not update order ${order.id}. ${err}`)
        }
    }

    async delete(id: string, payload: TokenInterface | null): Promise<Order> {
        try {
            // Check for attempt to delete order not owned
            if (payload && payload.user.own) {
                let currentOrder = await this.show(id, null);
                if (currentOrder.user_id != payload.user.id) {
                    throw new Error('You are not authorised to delete orders that you don\'t own');
                }
            }

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
            throw new Error(`Could not delete order ${id}. ${err}`)
        }
    }

    async currentOrders(id: string): Promise<Order[]> {
        try {
            const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=\'active\'';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            if (result.rowCount) {
                return this.resultToOrdersArray(result, id);
            } else {
                return result.rows[0];
            }

        } catch (err) {
            throw new Error(`Could not get current orders for user_id ${id}. ${err}`)
        }
    }

    async completedOrders(id: string): Promise<Order[]> {
        try {
            const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=\'complete\'';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return this.resultToOrdersArray(result, id);
        } catch (err) {
            throw new Error(`Could not get current order for user_id ${id}. ${err}`)
        }
    }

    // Gets a list of products and quantities associated with this order
    async #getProductList(order: string): Promise<OrderProducts[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM order_products WHERE order_id = ($1)';
            const result = await conn.query(sql, [order]);
            conn.release();
            const products: OrderProducts[] = [];
            for (var i = 0; i < result.rows.length; i++) {
                products[i] = {
                    product_id: result.rows[i].product_id,
                    quantity: result.rows[i].quantity
                };
            }
            return products;
        } catch (err) {
            throw new Error(`Could not get order_products. ${err}`)
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
                throw new Error(`Could not find order_products for order_id ${order}. ${err}`)
            }

            // If an existing listing is found then update the quantity for the existing listing
            if (existing) {
                try {
                    const sql = 'UPDATE order_products SET quantity = ($1) WHERE id = ($2)';
                    const conn = await db.connect();
                    const result = await conn.query(sql, [existing.quantity + products[i].quantity, existing.id]);
                    conn.release();
                } catch (err) {
                    throw new Error(`Could not find order_products for order_id ${order}. ${err}`)
                }
            } else {    // Otherwise create a new entry for that product
                try {
                    const sql = 'INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *';
                    const conn = await db.connect();
                    const result = await conn.query(sql, [order, products[i].product_id, products[i].quantity]);
                    conn.release();
                } catch (err) {
                    throw new Error(`Could not add new order_products for order_id ${order} and product_id ${products[i].product_id}. ${err}`)
                }
            }
        }
    }

    // Deletes a list of products for a given order
    async #deleteProductList(order: string): Promise<void> {
        const orderProducts = await this.#getProductList(order);

        try {
            for (var i = 0; i < orderProducts.length; i++) {
                const sql = 'DELETE FROM order_products WHERE order_id=($1)';
                const conn = await db.connect();
                await conn.query(sql, [order]);
            }
        } catch (err) {
            throw new Error(`Could not add delete order_products for order_id ${order}. ${err}`);
        }
    }

    private async resultToOrdersArray(result: QueryResult<any>, user_id: string | null): Promise<Order[]> {
        let orders: Order[] = [];

        try {
            for (let i = 0; i < result.rows.length; i++) {
                // If we're listing orders for a specific user, filter out orders that are not owned by that user
                if (!user_id || user_id == result.rows[i].user_id) {
                    orders.push({
                        id: result.rows[i].id,
                        user_id: result.rows[i].user_id,
                        recipient_name: result.rows[i].recipient_name,
                        delivery_address: result.rows[i].delivery_address,
                        date_time: result.rows[i].date_time,
                        status: result.rows[i].status,
                        products: await this.#getProductList(result.rows[i].id)
                    });
                }
            }
            return orders;
        } catch (err) {
            throw new Error(`Could not create orders array ${user_id ? `for user_id ${user_id}.` : '.'} ${err}`);
        }
    }

}