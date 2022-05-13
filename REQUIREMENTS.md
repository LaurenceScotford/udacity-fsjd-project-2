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
- Create [token required] : 'users/' [POST]

### Orders

- Current Order by user (args: user id)[token required] : 'open_order/:id' [GET]
- [OPTIONAL] Completed Orders by user (args: user id)[token required] : 'completed_orders/:id' [GET]

## Data Shapes

### Product

- id
- name
- price
- [OPTIONAL] category

### User

- id
- first_name
- last_name
- password

### Orders

- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

## Implementation

### Enhancements to base requirements

- All optional features implemented
- Top 5 products endpoint is now top (x) products - allowing any quantity to be displayed
- Update route added for products
- Destroy route added for products
- Update route added for users
- Destroy route added for users
- Register route added for users
- Authenticate route added for users
- Create route added for orders
- Index route added for orders
- Show route added for orders
- Update route added for orders
- Destroy route added for orders
- Categories data shape added with properties: id - unique id; category - name of category
- Additional properties for User data shape: username - unique, human readable username; auth_level - number indicating authorisation level
- Additional properties for Products data shape: url - a url to an image of the product; description - a description of the product
- Additional properties for Order data shape: delivery_address - the address the order should be delivered to; date_time - a timestamp indicating when the order was made or last updated
- jwt token payload now includes authorisation level so that operations can also be restricted based on a user's authorisation level as well as presence of the token
- Permanent super user to ensure access to all routes of the API is always possible

### Models

**Users** - A list of valid users for the database.

| Property   | Description                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| id         | A unique id representing this user                                                                                    |
| auth_level | An integer value (1 or above) representing the authorisation level of this user (see Authorisation description below) |
| first_name | The actual first name of the user                                                                                     |
| last_name  | The actual last name of the user                                                                                      |
| username   | A unique identifier for the user - also used to access the account                                                    |
| password   | The password used to access the user's account                                                                        |

**Categories** - A list of categories for types of product sold

| Property | Description                                         |
| -------- | --------------------------------------------------- |
| id       | A unique id representing this category              |
| category | The name of the category (this must also be unique) |

**Products** - A list of products for sale

| Property    | Description                                    |
| ----------- | ---------------------------------------------- |
| id          | A unique id representing this product          |
| name        | A name describing the product                  |
| url         | A url for an image of the product              |
| description | A description of the product                   |
| price       | A numeric price for the product                |
| category    | The id of the category this product belongs to |

**Orders** - A list of customer orders

| Property         | Description                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id               | A unique id representing this order                                                                                                                                                |
| user_id          | The id of the user the order belongs to                                                                                                                                            |
| delivery_address | Where the order should be sent to                                                                                                                                                  |
| date_time        | A timestamp that records when the order was created or last updated                                                                                                                |
| status           | Either 'active' if the order is current and not yet fulfilled or 'complete' if the order has been fulfilled. Any user can only ever have either 0 or 1 active orders.              |
| products         | A list of products included in the order. Each product has two fields: product_id - the id of the product being ordered, and quantity - how many of that product are being ordered |

### Database schema

**users table**
| Field | Type |
| --- | --- |
| id | SERIAL PRIMARY KEY |
| auth_level | int |
| first_name | VARCHAR |
| last_name | VARCHAR |
| username | VARCHAR UNIQUE |
| password_digest | VARCHAR |

**categories table**
| Field | Type |
| --- | --- |
| id | SERIAL PRIMARY KEY |
| category | VARCHAR(50) UNIQUE |

**products table**
| Field | Type |
| --- | --- |
| id | SERIAL PRIMARY KEY |
| name | VARCHAR |
| url | VARCHAR |
| description | VARCHAR |
| price | NUMERIC(12, 2) |
| category | bigint REFERENCES categories(id) |

**orders table**
| Field | Type |
| --- | --- |
| id | SERIAL PRIMARY KEY |
| user_id | bigint REFERENCES users(id) |
| delivery_address | VARCHAR |
| date_time | bigint |
| status | order_status type ENUM('active', 'complete') |

**order_products table**
| Field | Type |
| --- | --- |
| id | SERIAL PRIMARY KEY |
| order_id | bigint REFERENCES orders(id) |
| product_id | bigint REFERENCES products(id) |
| quantity | integer |

### Routes

To use the API, append the URL with a route to one of the following endpoints:

| Operation            | HTTP verb | Endpoint                    | Authentication required | Body                                                                                                                                               | Returns                                                   |
| -------------------- | --------- | --------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Register user        | POST      | `/users/register`           | No                      | JSON object with values. id can be set to an empty string as it will be created automatically                                                      | JSON file with the created user                           |
| Create user          | POST      | `/users`                    | Yes                     | JSON object with values. id can be set to an empty string as it will be created automatically                                                      | JSON file with the created user                           |
| Index users          | GET       | `/users`                    | Yes                     | None                                                                                                                                               | JSON file with array of users                             |
| Show user            | GET       | `/users/:id`                | Yes                     | None                                                                                                                                               | JSON file with selected user                              |
| Update user          | PUT       | `/users/:id`                | Yes                     | JSON object containing properties to be amended with new values (any properties not included will be left unchanged)                               | JSON file with the updated user                           |
| Destroy user         | DELETE    | `/users/:id`                | Yes                     | None                                                                                                                                               | JSON file with the deleted user                           |
| Authenticate user    | POST      | `/users/authenticate`       | No                      | JSON object containing the following properties: username: user name for the user to be logged in; password: password for the user to be logged in | JSON file with a token for the authenticated user.        |
| Create category      | POST      | `/categories`               | Yes                     | JSON object with values. id can be set to an empty string as it will be created automatically                                                      | JSON file with the created category                       |
| Index categories     | GET       | `/categories`               | No                      | None                                                                                                                                               | JSON file with array of categories                        |
| Show category        | GET       | `/categories/:id`           | No                      | None                                                                                                                                               | JSON file with selected category                          |
| Update categories    | PUT       | `/categories/:id`           | Yes                     | JSON object containing property to be amended with new value                                                                                       | JSON file with the updated category                       |
| Destroy category     | DELETE    | `/categories/:id`           | Yes                     | None                                                                                                                                               | JSON file with the deleted category                       |
| Create product       | POST      | `/products`                 | Yes                     | JSON object with values. id can be set to an empty string as it will be created automatically                                                      | JSON file with the created product                        |
| Index products       | GET       | `/products`                 | No                      | None                                                                                                                                               | JSON file with array of products                          |
| Show product         | GET       | `/products/:id`             | No                      | None                                                                                                                                               | JSON file with selected product                           |
| Update product       | PUT       | `/products/:id`             | Yes                     | JSON object containing properties to be amended with new values (any properties not included will be left unchanged)                               | JSON file with the updated product                        |
| Destroy product      | DELETE    | `/products/:id`             | Yes                     | None                                                                                                                                               | JSON file with the deleted product                        |
| Products by category | GET       | `/products_in_category/:id` | No                      | None                                                                                                                                               | JSON file with a list of products in the given category   |
| Top Products         | GET       | `/top_products/:max`        | No                      | None                                                                                                                                               | JSON file with an array of up to max top selling products |
| Create order         | POST      | `/orders`                   | Yes                     | JSON object with values. id can be set to an empty string as it will be created automatically                                                      | JSON file with the created order (see below)              |
| Index orders         | GET       | `/orders`                   | Yes                     | None                                                                                                                                               | JSON file with array of orders                            |
| Show order           | GET       | `/orders/:id`               | Yes                     | None                                                                                                                                               | JSON file with selected order                             |
| Update order         | PUT       | `/orders/:id`               | Yes                     | JSON object containing properties to be amended with new values (any properties not included will be left unchanged)                               | JSON file with the updated order                          |
| Destroy order        | DELETE    | `/orders/:id`               | Yes                     | None                                                                                                                                               | JSON file with the deleted order                          |
