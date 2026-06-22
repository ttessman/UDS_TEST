FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared-ui/package.json shared-ui/tsconfig.json ./shared-ui/
COPY components/frontend/package.json components/frontend/tsconfig.json components/frontend/vite.config.ts components/frontend/index.html ./components/frontend/

RUN npm install --include=optional
RUN rollup_version="$(node -p "require('./node_modules/rollup/package.json').version")" \
  && case "$(node -p "process.arch")" in \
    arm64) npm install --no-save "@rollup/rollup-linux-arm64-musl@${rollup_version}" ;; \
    x64) npm install --no-save "@rollup/rollup-linux-x64-musl@${rollup_version}" ;; \
    *) echo "No explicit Rollup native package mapping for $(node -p "process.arch")" ;; \
  esac

COPY shared ./shared
COPY shared-ui ./shared-ui
COPY components/frontend ./components/frontend

RUN npm run build -w @uds-poc/shared \
  && npm run build -w @uds-poc/shared-ui \
  && npm run build -w @uds-poc/frontend

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY components/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/components/frontend/dist /usr/share/nginx/html

EXPOSE 8080
