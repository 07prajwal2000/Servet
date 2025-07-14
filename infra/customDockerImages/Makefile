build_app:
	go build -o agent main.go

build_docker:
	docker build -f ./custom-node-docker/Dockerfile -t cnode-builder .

build: build_app build_docker