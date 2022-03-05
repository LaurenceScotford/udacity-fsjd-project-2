CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    price NUMERIC(12, 2),
    category bigint REFERENCES categories(id)
);