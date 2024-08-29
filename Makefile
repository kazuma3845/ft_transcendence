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
	-docker compose -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans
	-docker system prune -a --volumes -f

re: clean up
