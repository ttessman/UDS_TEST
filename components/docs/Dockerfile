FROM node:22-alpine AS build

WORKDIR /app

COPY components/docs/package.json ./package.json

RUN npm install --include=optional

COPY components/docs ./

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY components/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
