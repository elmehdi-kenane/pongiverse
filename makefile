
all:
	docker-compose  -f ./docker-compose.yml up --build
down:
	docker-compose  -f ./docker-compose.yml down
re:
	docker-compose  -f ./docker-compose.yml down
	docker-compose  -f ./docker-compose.yml up --build
clean:
	@docker stop $$(docker ps -qa)
	@docker rm $$(docker ps -qa)
	@docker rmi -f $$(docker images -qa)
	@docker volume rm $$(docker volume ls -q)
	@docker network rm $$(docker network ls -q)
	@echo "Cleaned up all containers, images, volumes and networks"