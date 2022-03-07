# Storefront Backend Project

This is my submission for the second project for the Udacity Full Stack Javascript Developer Nanodegree.

## About

This is a web API to provide backend functionality for an online storefront. It runs on node.js and express using a postgres database.

The following models are supported:

**Users** - A list of valid users for the database.

| Field | Description |
| ----- | ----------- |
| id | A unique id representing this user |
| auth_level | An integer value (1 or above) representing the authorisation level of this user (see Authorisation description below)
| first_name | The actual first name of the user |
| last_name | The actual last name of the user |
| username | A unique identifier for the user - also used to access the account |
| password | The password used to access the user's account |


**Categories** - A list of categories for types of product sold

| Field | Description |
| ----- | ----------- |
| id | A unique id representing this category |
| category | The name of the category (this must also be unique) |


**Products** - A list of products for sale

| Field | Description |
| ----- | ----------- |
| id | A unique id representing this product |
| name | A name describing the product |
| price | A numeric price for the product |
| category | The id of the category this product belongs to |


**Orders** - A list of customer orders  

| Field | Description |
| ----- | ----------- |
| id | A unique id representing this order |
| user_id | The id of the user the order belongs to |
| status | Either 'active' if the order is current and not yet fulfilled or 'complete' if the order has been fulfilled. Any user can only ever have either 0 or 1 active orders. |
| products | A list of products included in the order. Each product has two fields: product_id - the id of the product being ordered, and quantity - how many of that product are being ordered |

## Using the API

NOTE: You can see a copy of these usage instructions by visiting the root of the API service in a web browser.

The API supports the following operations:


### User operations ###

| Operation | Description |
| --- | --- |
| Register user | This is for creation of non-administrative users, e.g. customers. This operation does not require authorisation, so can be used for self-service registration. |
| Create user | This is a generalised operation for creation of users and it requires authorisation. This operation can be used for creating admin users, for example. A user can only create other users up to and including their own level of authorisation. |
| Index users | This lists all users on the system. It is only accessible to admin users. |
| Show user | This shows a single user. Non-admin users can only access their own record. |
| Update user | This enables an existing user record to be updated. Non-admin users can only update their own record. |
| Destroy user | This enables a user record to be permanantly removed. Non-admin users can only destroy their own record. This operation will fail if there are any orders belonging to this user | 
| Authenticate user | This should be used as part of a login process to verify a user. This operation is required before many other operations can be carried out. |


### Category operations ###

| Operation | Description |
| --- | --- |
| Create category | This creates a new product category. This operation is only available to admin users. |
| Index categories | This lists all product categories. |
| Show category | This shows a single product category. |
| Update category | This enables an existing product category to be updated. This operation is only available to admin users. |
| Destroy category | This enables a product category to be permanantly removed. This operation will fail if any products exist that are in that category. This operation is only available to admin users | 


### Product operations ###

| Operation | Description |
| --- | --- |
| Create product | This creates a new product. This operation is only available to admin users. |
| Index products | This lists all products. |
| Show product | This shows a single product. |
| Update products | This enables an existing product to be updated. This operation is only available to admin users. |
| Destroy product | This enables a product to be permanantly removed. This operation will fail if any orders exist that contain that product. This operation is only available to admin users | 
| Products by category | This lists all products in a given category. |
| TopProducts(x) | This lists up to x top selling products. Products in active orders are not counted when this list is created. |


### Order operations ###

| Operation | Description |
| --- | --- |
| Create order | This creates a new order. |
| Index orders | This lists all orders. Non-admin users will only see their own orders. |
| Show order | This shows a single product. Non-admin users can view their own orders only. |
| Update orders | This enables an existing order to be updated. Non-admin users can update their own orders only. |
| Destroy order | This enables an order to be permanantly removed. Non-admin users can destroy their own orders only. | 


### Routes
To use the API, append the URL with a route to one of the following endpoints:

| Operation | HTTP verb | Endpoint | Authentication required | Body | Returns |
| --- | --- | --- | --- | --- | --- |
| Register user | POST | `/users/register` | No | JSON object with values. id can be set to an empty string as it will be created automatically | JSON file with the created user |
| Create user | POST | `/users` | Yes | JSON object with values. id can be set to an empty string as it will be created automatically | JSON file with the created user |
| Index users | GET | `/users` | Yes | None | JSON file with array of users |
| Show user | GET | `/users/:id` | Yes | None | JSON file with selected user |
| Update user | PUT | `/users/:id` | Yes | JSON object containing properties to be amended with new values (any properties not included will be left unchanged) | JSON file with the updated user |
| Destroy user | DELETE | `/users/:id` | Yes | None | JSON file with the deleted user |
| Authenticate user | POST | `/users/authenticate` | No | JSON object containing the following properties: username: user name for the user to be logged in; password: password for the user to be logged in | JSON file with a token for the authenticated user. |
| Create category | POST | `/categories` | Yes | JSON object with values. id can be set to an empty string as it will be created automatically | JSON file with the created category |
| Index categories | GET | `/categories` | No | None | JSON file with array of categories |
| Show category | GET | `/categories/:id` | No | None | JSON file with selected category |
| Update categories | PUT | `/categories/:id` | Yes | JSON object containing property to be amended with new value | JSON file with the updated category |
| Destroy category | DELETE | `/categories/:id` | Yes | None | JSON file with the deleted category |
| Create product | POST | `/products` | Yes | JSON object with values. id can be set to an empty string as it will be created automatically | JSON file with the created product |
| Index products | GET | `/products` | No | None | JSON file with array of products |
| Show product | GET | `/products/:id` | No | None | JSON file with selected product |
| Update product | PUT | `/products/:id` | Yes | JSON object containing properties to be amended with new values (any properties not included will be left unchanged) | JSON file with the updated product |
| Destroy product | DELETE | `/products/:id` | Yes | None | JSON file with the deleted product |
| Products by category | GET | `/products_in_category/:id` | No | None | JSON file with a list of products in the given category |
| Top Products | GET | `/top_products/:max` | No | None | JSON file with an array of up to max top selling products |
| Create order | POST | `/orders` | Yes | JSON object with values. id can be set to an empty string as it will be created automatically | JSON file with the created order (see below) |
| Index orders | GET | `/orders` | Yes | None | JSON file with array of orders |
| Show order | GET | `/orders/:id` | Yes | None | JSON file with selected order |
| Update order | PUT | `/orders/:id` | Yes | JSON object containing properties to be amended with new values (any properties not included will be left unchanged) | JSON file with the updated order |
| Destroy order | DELETE | `/orders/:id` | Yes | None | JSON file with the deleted order |


### Authorisation

The system works on the principle that each user has an authorisation level. The minimum authorisation level is 1 and higher levels can be any integer value above this.
The default build assumes three levels of authorisation:

- Level 1: End user - this level is intended to represent customers. They have access to all operations required for creating and maintaining their user account and for making and modifying orders.
- Level 2: Admin user - this level is intended to represent administrative users. They have access to all operations and can access data not directly associated with their user account.
- Level 3: Super user - this is a permanant user. Only one super user account exists and it is created automatically when the application begins. The presence of the super user account ensures that the full REST api can always be accessed, even if no other user accounts exist. When the application is first started after an install, you will want to authorise the super user account and use this to create any admin level user accounts that are initially required. NOTE: Creation fo additional super user accounts or modification/deletion of the existing super user account is not permitted within the API.

A few operations, e.g. viewing products or product categories, can be accessed with authorisation. Most operations require a user to be authenticated before they can be accessed.
Use the Authenticate route to authenticate a user. If the user is valid, this route will return a secure web token. This token must be sent in the Authorization header with any operation that requires authorisation.

For operations that require authorisation, there are potentially two levels of access:
- Own records: The user can only access records that are owned by them, e.g. their user account and their orders. Customers are generally confined to this level of access.
- Universal access: The user can access any records. This level of access is generally assigned only to administrative users.

Any route that requires authorisation is first passed through the verifyAuthToken middleware. This middleware takes three additional parameters: minimum level for any access, minimum level for universal access, comparison property for ensuring access to own records only (this can be set to null for records where there is no concept of ownership by a user account, e.g. catgeories or products). Attempts to access this route by a user without the required authorisation level will be blocked.

#### Example

Let's say that the minimum level for any access is set to 2 and the minimum level for universal access is set to 3. This is how the following three users would be impacted:

| User | Authorisation level  | Access permitted |
| --- | --- | --- |
| Alan | 1 | None |
| Barbara | 2 | Own records only |
| Colin | 3 | All records |

### A note on password security

Passwords are stored in an encrypted form in the database. The API will never return password data, therefore, when a user record is requested, the password property is always blank. One possible method for handling lost passwords, given this configuration, is for an admin user to modify the user record with a temporary password and then for the user to change this after successful login.

## Set up and scripts

### To set up the project

Create a .env file in the project root. *NOTE*: An example .env file has been included for the purpose of testing the solution only. To use this you can simply rename `.env.example` to `.env`. 

The env file should contain the following environment variables. :

| Variable name | Purpose |
| --- | --- |
| ENV | This should normally be left set to 'dev' to ensure the development/production database is used (this database is persistent and will not be removed or deleted between sessions). This variable will automatically be overwritten to use the test database if the test suite is run (see Test script below). |
| DEFAULT_POSTGRES_PORT | This should normally be set 5432 |
| PROD_POSTGRES_HOST | Host URL or IP address for the postgres database |
| PROD_POSTGRES_PORT | The port that should be exposed to access the postgres database |
| PROD_POSTGRES_DB | Name for the postgress database |
| PROD_POSTGRES_USER | Name of the user the API should create to access the database |
| PROD_POSTGRES_PASSWORD | Password the API should use to access the database |
| TEST_POSTGRES_HOST | Host URL or IP address for the test database |
| TEST_POSTGRES_PORT | The port that should be exposed to access the test database |
| TEST_POSTGRES_DB | Name for the test database |
| TEST_POSTGRES_USER | Name of the user the API should create to access the test database |
| TEST_POSTGRES_PASSWORD | Password the API should use to access the test database |
| API_HOST | The base URL or IP address that should be used to access the API |
| API_PORT | The port that should be exposed to access the API |
| DEFAULT_USER_AUTHLEVEL | The authorisation level that will be given to end users who use the registration route. Normally you will want to leave this set to 1 (the lowest level) |
| SUPERUSER_AUTHLEVEL | The authorisation level that will be given to the super user account that is automatically created. This should be the highest authorisation level in use. |
| SUPERUSER_USERNAME | The username that will be given to the super user account that is automatically created. |
| SUPERUSER_PASSWORD | The password that will be given to the super user account that is automatically created. |
| BCRYPT_PASSWORD | The password that will be used for the function that encrypts and decrypts user passwords. | 
| SALT_ROUNDS | The number of salt rounds to use when encrypting user passwords. |
| TOKEN_SECRET | A string that is used as the private key for creating user authorisation tokens. |

Set up the database (NOTE: this app uses a dockerised version of the postgres database to avoid having to install postgres locally)
```
docker-compose up
```

Install the application:
```
npm install
```

Not a required, set up step, but at this point you might want to run the test suite to ensure that everything is running as it should:
```
npm run test
```
NOTE: The test suite uses the Test database - this database is set up immediately prior to running the tests and then torn down again immediately afterwards. 

Start the application:

```
npm run start
```

NOTE this will run the required database migrations using db-migrate before starting the server.

Stopping the application:

You can stop the running node server by hitting `CRTL + C` in the terminal in which it is running. Note this will terminate the application but will leave the database intact and the postgres servers running. 

To remove the database (CAUTION: This will permanantly destroy all data):
```
npm run migrate-down
```

To stop and remove the postgres database servers:
```
docker-compose down
```

## Third party libraries and resources

- This project is based on starter files supplied by [Udacity](https://www.udacity.com/)
- The application is created with [typescript](https://www.typescriptlang.org/) and runs in [node](https://nodejs.org/en/) and uses [express](https://expressjs.com/) to create the web API
- The database servers run in [docker](https://www.docker.com/) with the official [postgres image](https://hub.docker.com/_/postgres)
- Database migrations are managed using [db-migrate](https://www.npmjs.com/package/db-migrate)
- Database access is managed with [node-postgres](https://www.npmjs.com/package/pg) 
- Environment variables are managed with [dotenv](https://www.npmjs.com/package/dotenv)
- User authorisation/authentication is managed with [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- Password encryption/decryption is managed with [bcrypt](https://www.npmjs.com/package/bcrypt)
- The test suite is created with [jasmine](https://www.npmjs.com/package/jasmine)
- Typescript execution/compilation is managed with [ts-node](https://www.npmjs.com/package/ts-node) and [tsc-watch](https://www.npmjs.com/package/tsc-watch)
- npm script execution is enhanced with [npm-run-all](https://www.npmjs.com/package/npm-run-all) and [cross-env](https://www.npmjs.com/package/cross-env)
