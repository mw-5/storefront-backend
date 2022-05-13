CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    price BIGINT,
    category_id BIGINT REFERENCES categories(id)
);