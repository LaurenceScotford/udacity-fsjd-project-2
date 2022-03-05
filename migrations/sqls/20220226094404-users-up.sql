CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    auth_level int,
    first_name VARCHAR,
    last_name VARCHAR,
    username VARCHAR UNIQUE,
    password_digest VARCHAR
);