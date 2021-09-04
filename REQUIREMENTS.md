# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

### Products

- Index : 'products/' [GET]
- Show : 'products/:id' [GET]
- Create [token required] : 'products/' [POST]
- [OPTIONAL] Top 5 most popular products : 'top_products/' [GET]
- [OPTIONAL] Products by category (args: product category) : 'products_in_category/:id'

### Users

- Index [token required] : 'users/' [GET]
- Show [token required] : 'users/:id' [GET]
- Create N[token required] : 'users/' [POST]

### Orders

- Current Order by user (args: user id)[token required] : 'open_order/:id' [GET]
- [OPTIONAL] Completed Orders by user (args: user id)[token required] : 'completed_orders/:id' [GET]

## Data Shapes

### Product

- id
- name
- price
- [OPTIONAL] category

#### Implementation

Table: categories (id: SERIAL PRIMARY KEY, category VARCHAR(50) UNIQUE)
Table: products (id: SERIAL PRIMARY KEY, name: VARCHAR, price: NUMERIC(12,2), category: bigint [foreign key to id in categories table])

### User

- id
- first_name
- last_name
- password_digest

#### Implementation

Table: users (id: SERIAL PRIMARY KEY, first_name: VARCHAR, last_name: VARCHAR, password_digest: VARCHAR)

### Orders

- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

#### Implementation

Table: orders (id: SERIAL PRIMARY KEY, user_id: bigint [foreign key to users table], status: ENUM('active', 'complete'))
Table: order_products (id: SERIAL PRIMARY KEY, order_id: bigint [foreign key to id in orders table], product_id: bigint [foreign key to id in products table], quantity: integer)
