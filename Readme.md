# Servet - A Vercel/Netlify Clone
Servet (pronounced as Serve-It) is a Vercel/Netlify clone. It is a simple application that builds, deploys, and hosts static sites. 

### 🚧 STILL DEVELOPING 

# Project Structure
- [scheduler-server](./scheduler-server/): User facing api & ui project.
- [scheduler-controller](./scheduler-controller/): Background processing application responsible for scheudling the workers (who builds the static sites).
- [main worker](./infra/customDockerImages/): Is the main culprit which builds the app, collects logs and pushes to clickhouse and publishes the artificats to S3 (minio) and kills itself after done or certain timeout.

# Technologies
- NodeJs: Written user-facing and worker scheduler apps
- Go: Used in worker docker images and does all the heavy lifting
- Kafka: Async + persistant streaming server helpful for scheduling workers
- Clickhouse: Stores logs data
- Redis: For pub/sub from workers to users
- Postgres: Main data store
- Docker: Sandbox compute
- Minio (S3): Artifact storage
- Caddy Server: Acts as a reverse proxy and forwards the traffic from browser (manipulates the url) and sends to S3 (minio)
- Grafana: Logs dashboard

# Building
- Builds the worker agent and docker image (docker required)
  ```sh
  GOOS='linux' CGO_ENABLED=0
  cd infra/customDockerImages
  make build
  ```
- Run the scheduler server
  ```
  cd scheduler-server
  npm run dev:watch
  ```
- Run the scheduler controller
  ```
  cd scheduler-controller
  npm run dev:watch
  ```