# storefront-backend
Storefront backend

Installation instructions:

This app uses the following ports:
 - The server runs on port 3000.
 - The database runs on port 5432.

Setup of database and connecting to it:
1. Install Docker Desktop

2. add an .env file to the project folder which only contains this entry and nothing else:
	POSTGRES_PASSWORD=yourpassword

3. run this command with the project folder being your current working directory:
	docker-compose up

4. Now replace the content of the .env file with variables needed for the project:
	POSTGRES_HOST=127.0.0.1
	POSTGRES_DB=storefront_backend_dev
	POSTGRES_DB_TEST=storefront_backend_test
	POSTGRES_USER=yourusername
	POSTGRES_PASSWORD=yourpassword
	ENV=dev

5. Create the databases:

	- To connect psql to docker container that runs PostgreSQL database follow these steps (Linux terminal):
		1.) To get container id run:
			docker ps
		2.) To connect to container with bash run:
			docker exec -it id_of_container bash
		3.) To connect with psql to database server run:
			su postgres
			psql postgres

	- Execute these commands from psql to create user role and databases:
		CREATE USER yourusername WITH PASSWORD yourpassword;
		CREATE DATABASE storefront_backend_dev;
		CREATE DATABASE storefront_backend_test;
		\c storefront_backend_dev
		GRANT ALL PRIVILEGES ON DATABASE storefront_backend_dev TO yourusername;
		\c storefront_backend_test
		GRANT ALL PRIVILEGES ON DATABASE storefront_backend_test TO yourusername;

6. Install db-migrate for the command line by running:
	npm i db-migrate -g


Installation of dependencies:
To install the packages needed by this app run:
	npm install



