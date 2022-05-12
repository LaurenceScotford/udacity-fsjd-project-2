CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    price NUMERIC(12, 2),
    url VARCHAR,
    description VARCHAR,
    category bigint REFERENCES categories(id)
);