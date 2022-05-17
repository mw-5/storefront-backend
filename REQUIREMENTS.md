# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
#### Products
- Index -> '/products' [GET]
- Show -> '/products/:id' [GET]
- Create [token required] -> '/products' [POST]
- [OPTIONAL] Top 5 most popular products -> '/top_5_popular_products' [GET]
- [OPTIONAL] Products by category (args: product category) -> '/categories/:id/products' [GET]

#### Users
- Index [token required] -> '/users' [GET]
- Show [token required] -> '/users/:id' [GET]
- Create N[token required] -> '/users' [POST]

#### Orders
- Current Order by user (args: user id)[token required] -> '/users/:id/current_order' [GET]
- [OPTIONAL] Completed Orders by user (args: user id)[token required] -> '/users/:id/completed_orders' [GET]

## Data Shapes
#### Product
-  id
- name
- price
- [OPTIONAL] category

Table: products (
    id: serial primary key,
    name: varchar,
    price: bigint,
    category_id: bigint [foreign key to categories table]
)
Table: categories (
    id: serial primary key,
    name: varchar(50)
)

#### User
- id
- firstName
- lastName
- password

Table: users (
    id: varchar(50) primary key,
    first_name: varchar,
    last_name: varchar,
    password_digest: varchar
)

#### Orders
- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

Table: orders (
    id: serial primary key,
    user_id: varchar(50) [foreign key to users table],
    is_completed: boolean not null
)
Table: order_products (
    id: serial primary key,
    order_id: bigint [foreign key to orders table],
    product_id: bigint [foreign key to products table],
    quantity: integer
)
