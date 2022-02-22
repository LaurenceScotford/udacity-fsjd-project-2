# Storefront Backend Project

This is my submission for the second project for the Udacity Full Stack Javascript Developer Nanodegree.

## About

This is a web API to provide backend functionality for an online storefront. It runs on node.js and express using a postgres database.

## Using the API

NOTE: You can see a copy of these usage instructions by visiting the root of the API service in a web browser.


## Set up and scripts

To set up the project (NOTE normally some of this detail would not be included in a README file, but has been included here to allow the project to be set up for evaluation):

Create a .env file in the project root with the server and database connection details as follows (NOTE: these details should only be used for testing the solution NOT for confidential data. Ports can be changed here if you have a conflict with existing services):

```
ENV=dev

PROD_POSTGRES_HOST=127.0.0.1
PROD_POSTGRES_DB=store
PROD_POSTGRES_USER=store_user
PROD_POSTGRES_PASSWORD=shopkeeper_a1

TEST_POSTGRES_HOST=127.0.0.1
TEST_POSTGRES_DB=test_store
TEST_POSTGRES_USER=test_store_user
TEST_POSTGRES_PASSWORD=fall_guy_z100

API_HOST=127.0.0.1
API_PORT=3000
```

Set up the database (NOTE: this app uses a dockerised version of the postgres database to avoid having to install postgres locally)
```
docker-compose up
```

Install the application:
```
npm install
```

Start the application:

```
npm run start
```

NOTE this will run the required database migrations using db-migrate before starting the server.

## Third party libraries and resources

This project is based on starter files supplied by [Udacity](https://www.udacity.com/).

## Getting Started

This repo contains a basic Node and Express app to get you started in constructing an API. To get started, clone this repo and run `yarn` in your terminal at the project root.

## Required Technologies

Your application must make use of the following libraries:

- Postgres for the database
- Node/Express for the application logic
- dotenv from npm for managing environment variables
- db-migrate from npm for migrations
- jsonwebtoken from npm for working with JWTs
- jasmine from npm for testing

## Steps to Completion

### 1. Plan to Meet Requirements

In this repo there is a `REQUIREMENTS.md` document which outlines what this API needs to supply for the frontend, as well as the agreed upon data shapes to be passed between front and backend. This is much like a document you might come across in real life when building or extending an API.

Your first task is to read the requirements and update the document with the following:

- Determine the RESTful route for each endpoint listed. Add the RESTful route and HTTP verb to the document so that the frontend developer can begin to build their fetch requests.  
  **Example**: A SHOW route: 'blogs/:id' [GET]

- Design the Postgres database tables based off the data shape requirements. Add to the requirements document the database tables and columns being sure to mark foreign keys.  
  **Example**: You can format this however you like but these types of information should be provided
  Table: Books (id:varchar, title:varchar, author:varchar, published_year:varchar, publisher_id:string[foreign key to publishers table], pages:number)

**NOTE** It is important to remember that there might not be a one to one ratio between data shapes and database tables. Data shapes only outline the structure of objects being passed between frontend and API, the database may need multiple tables to store a single shape.

### 2. DB Creation and Migrations

Now that you have the structure of the databse outlined, it is time to create the database and migrations. Add the npm packages dotenv and db-migrate that we used in the course and setup your Postgres database. If you get stuck, you can always revisit the database lesson for a reminder.

You must also ensure that any sensitive information is hashed with bcrypt. If any passwords are found in plain text in your application it will not pass.

### 3. Models

Create the models for each database table. The methods in each model should map to the endpoints in `REQUIREMENTS.md`. Remember that these models should all have test suites and mocks.

### 4. Express Handlers

Set up the Express handlers to route incoming requests to the correct model method. Make sure that the endpoints you create match up with the enpoints listed in `REQUIREMENTS.md`. Endpoints must have tests and be CORS enabled.

### 5. JWTs

Add JWT functionality as shown in the course. Make sure that JWTs are required for the routes listed in `REQUIUREMENTS.md`.

### 6. QA and `README.md`

Before submitting, make sure that your project is complete with a `README.md`. Your `README.md` must include instructions for setting up and running your project including how you setup, run, and connect to your database.

Before submitting your project, spin it up and test each endpoint. If each one responds with data that matches the data shapes from the `REQUIREMENTS.md`, it is ready for submission!
