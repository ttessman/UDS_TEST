FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY components/docs/package.json ./components/docs/package.json

RUN npm install --include=optional

COPY components/docs ./components/docs

RUN npm run build -w @uds-poc/docs

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY components/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/components/docs/build /usr/share/nginx/html

EXPOSE 8080
