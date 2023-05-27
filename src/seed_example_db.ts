// Seeds the database with simple examples
import bcrypt from 'bcryptjs';

import db from './database';

const categories = ['Books', 'Electrical', 'Travel', 'Clothing and Accessories', 'Kitchen and Dining']

const products = [
    {
        name: 'Book',
        price: 9.99,
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'You can read it!',
        category: 'Books'
    },
    {
        name: 'Headphones',
        price: 249.99,
        url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'Listen to stuff!',
        category: 'Electrical'
    },
    {
        name: 'Backpack',
        price: 79.99,
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'Carry things around town!',
        category: 'Travel'
    },
    {
        name: 'Glasses',
        price: 129.99,
        url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'Now you can see!',
        category: 'Kitchen and Dining'
    },
    {
        name: 'Cup',
        price: 4.99,
        url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'Drink anything with it!',
        category: 'Clothing and Accessories'
    },
    {
        name: 'Shirt',
        price: 29.99,
        url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=800&q=80',
        description: 'Wear it with style!',
        category: 'Clothing and Accessories'
    }
];

const user = {
    auth_level: 1,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    password: 'shopper123',
};

const order = {
    username: 'testuser',
    recipient_name: 'Test user',
    delivery_address: '1 High Street, Anytown, AN1 2OO',
    date_time: Date.now(),
    item: {
        product_name: 'Book',
        quantity: 1
    },
    status: 'complete'
};

(async () => {
    console.log('Starting to seed db!');
    try {
        const conn = await db.connect();
        // Create categories
        const find_category_sql = 'SELECT * FROM categories WHERE category = ($1)';
        const insert_category_sql = 'INSERT INTO categories (category) VALUES($1)';
        for (const category of categories) {
            const result = await conn.query(find_category_sql, [category]);
            if (result.rowCount === 0) {
                await conn.query(insert_category_sql, [category]);
            }
        }

        // Create products
        const get_category_key_sql = 'SELECT id FROM categories WHERE category = ($1)';
        const find_product_sql = 'SELECT * FROM products WHERE name = ($1) AND price = ($2) AND url = ($3) AND description = ($4) AND category = ($5)';
        const insert_product_sql = 'INSERT INTO products (name, price, url, description, category) VALUES($1, $2, $3, $4, $5)';

        for (const product of products) {
            const catId = await conn.query(get_category_key_sql, [product.category]);
            const result = await conn.query(find_product_sql, [product.name, product.price, product.url, product.description, catId.rows[0].id])
            if (result.rowCount === 0) {
                await conn.query(insert_product_sql, [product.name, product.price, product.url, product.description, catId.rows[0].id]);
            }
        }

        // Create user
        const find_user_sql = 'SELECT * FROM users WHERE username = ($1)';
        const insert_user_sql = 'INSERT INTO users (auth_level, first_name, last_name, username, password_digest) VALUES($1, $2, $3, $4, $5)';

        const userResult = await conn.query(find_user_sql, [user.username]);
        if (userResult.rowCount === 0) {
            await conn.query(insert_user_sql, [
                user.auth_level,
                user.first_name,
                user.last_name,
                user.username,
                bcrypt.hashSync(user.password + process.env.BCRYPT_PASSWORD,
                    parseInt(process.env.SALT_ROUNDS as string))
            ]);
        }

        // Create orders
        const get_user_id_sql = 'SELECT id FROM users WHERE username = ($1)';
        const insert_order_sql = 'INSERT INTO orders (user_id, recipient_name, delivery_address, date_time, status) VALUES($1, $2, $3, $4, $5) RETURNING id';
        const get_product_id = 'SELECT id FROM products WHERE name = ($1)';
        const insert_order_products_sql = 'INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3)'

        const userIdResult = await conn.query(get_user_id_sql, [order.username]);
        const orderId = await conn.query(insert_order_sql, [
            userIdResult.rows[0].id,
            order.recipient_name,
            order.delivery_address,
            order.date_time,
            order.status
        ]);
        const productId = await conn.query(get_product_id, [order.item.product_name]);
        await conn.query(insert_order_products_sql, [orderId.rows[0].id, productId.rows[0].id, order.item.quantity]);

        conn.release();
        console.log('Seeding of db completed!');
    } catch (err) {
        throw new Error(`Could not create seed database. ${err}`);
    }

    process.exit()

})();