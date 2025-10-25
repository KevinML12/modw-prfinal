backend/migrations/Makefile

.PHONY: migrate
migrate:
	cd backend/migrations && go run add_delivery_fields.go

.PHONY: build-migrate
build-migrate:
	cd backend/migrations && go build -o add_delivery_fields add_delivery_fields.go

.PHONY: run-migrate
run-migrate: build-migrate
	cd backend/migrations && ./add_delivery_fields
