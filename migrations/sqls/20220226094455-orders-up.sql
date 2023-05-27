CREATE TYPE order_status AS ENUM('active', 'complete');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id bigint REFERENCES users(id),
    recipient_name VARCHAR,
    delivery_address VARCHAR,
    date_time bigint,
    status order_status
);