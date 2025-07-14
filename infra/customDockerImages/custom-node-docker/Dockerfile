ARG VERSION=22.17.0-alpine

FROM node:${VERSION}

WORKDIR /app
RUN apk update
RUN apk add git
COPY ./agent ./agent
USER root
RUN chmod +x agent
ENTRYPOINT [ "./agent" ]