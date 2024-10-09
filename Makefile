COMPOSE_FILE=docker-compose.yml

up:
	docker compose -f $(COMPOSE_FILE) up --build -d

stop:
	docker compose -f $(COMPOSE_FILE) stop

start:
	docker compose -f $(COMPOSE_FILE) start

down:
	docker compose -f $(COMPOSE_FILE) down

clean:
	-docker compose -f $(COMPOSE_FILE) down --rmi all --remove-orphans
#	-docker system prune -a -f 
	-rm -rf ./website/srcs/staticfiles

re: clean up
