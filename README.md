# storefront-backend
Storefront backend

Installation instructions:

This app uses the following ports:
 - The server runs on port 3000.
 - The database runs on port 5432.


If you have PostgreSQL installed locally on Windows
but want to use provided Docker image of PostgreSQL in docker-compose.yml
make sure PostgreSQL is not running locally.
To stop Postgres on Windows:
	win + r > services.msc > stop postgresql
Source: https://github.com/sameersbn/docker-postgresql/issues/112


Setup:
1. Install Docker Desktop

2. Add an .env file to the project folder which only contains this entry and nothing else:
	POSTGRES_PASSWORD=yourpassword

3. Run this command with the project folder being your current working directory:
	docker-compose up

4. Now replace the content of the .env file with variables needed for the project:
	POSTGRES_HOST=127.0.0.1
	POSTGRES_DB=storefront_backend_dev
	POSTGRES_DB_TEST=storefront_backend_test
	POSTGRES_USER=yourusername
	POSTGRES_PASSWORD=yourpassword
	ENV=dev

5. Create the databases:

	- To connect psql to docker container that runs PostgreSQL database follow these steps:
		1.) To get container id and container name run:
			docker ps
		2.) To connect to container as postgres superuser with psql run:
			docker exec -it <id_of_container | name_of_container> psql -U postgres

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

7. To install dependencies of app run:
	npm install

8. To migrate databases for dev and test run:
	npm run migrate-dev
	npm run migrate-test




Further notes:

package.json contains a script called test.
The part:
	set ENV=test&&
was taken from this post:
https://knowledge.udacity.com/questions/662042
It solves the issue of ENV=test not working with Windows Powershell
without the need for additional dependencies.
