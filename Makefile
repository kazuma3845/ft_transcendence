COMPOSE_FILE=docker-compose.yml

up:
	# copy ~/Desktop/secrets/.env .
	# copy ~/Desktop/secrets/mycert.crt ./website
	# copy ~/Desktop/secrets/mykey.key ./website
	docker compose -f $(COMPOSE_FILE) up --build -d

stop:
	docker compose -f $(COMPOSE_FILE) stop

start:
	docker compose -f $(COMPOSE_FILE) start

down:
	docker compose -f $(COMPOSE_FILE) down

clean:
	-docker compose -f $(COMPOSE_FILE) down --rmi all --remove-orphans
	-docker system prune -a -f
	-rm -rf ./website/srcs/staticfiles

clean_v:
	@echo "Cleaning Docker containers, images, and volumes..."
	-docker compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans
	-docker system prune -a -f --volumes
	-rm -rf ./website/srcs/staticfiles

blockchain_reset:
	@echo "Resetting blockchain..."
	-rm -rf ./Blockchain/srcs/output/*
	-rm -rf ./Blockchain/volumes/*
	cd ./Blockchain/srcs && ./compile.sh

re: clean up

hard_reset: down blockchain_reset clean_v up
