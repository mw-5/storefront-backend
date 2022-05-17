CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    is_completed BOOLEAN NOT NULL
);