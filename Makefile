all: build run

build:
	docker build -t app-server .

run:
	docker stop app-server-container
	docker rm app-server-container
	docker run -i -p 8080:80 --name app-server-container app-server
