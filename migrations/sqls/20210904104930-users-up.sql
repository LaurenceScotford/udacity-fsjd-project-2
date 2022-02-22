CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR,
    last_name VARCHAR,
    username VARCHAR UNIQUE,
    password_digest VARCHAR
);