FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared-ui/package.json shared-ui/tsconfig.json ./shared-ui/
COPY components/docs/package.json ./components/docs/package.json

RUN npm install --include=optional

COPY shared ./shared
COPY shared-ui ./shared-ui
COPY components/docs ./components/docs

RUN npm run build -w @uds-poc/shared \
  && npm run build -w @uds-poc/shared-ui \
  && npm run build -w @uds-poc/docs

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY components/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/components/docs/build /usr/share/nginx/html

EXPOSE 8080
