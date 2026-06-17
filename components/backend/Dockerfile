FROM node:20-alpine

WORKDIR /app

ARG TARGETARCH
ARG KUBECTL_VERSION=v1.32.0
ARG UDS_VERSION=0.28.3
ARG ZARF_VERSION=0.73.0

RUN apk add --no-cache ca-certificates curl \
  && case "${TARGETARCH:-amd64}" in \
    amd64) \
      uds_arch="amd64"; \
      uds_sha="07210dd8970017be7d3100682578ffa581732264b686646190c63cce9db42265"; \
      zarf_arch="amd64"; \
      zarf_sha="d6777f6d654f1088339060527cd5a67ecbd95a1037a816180cb1cc94f2c38db9"; \
      ;; \
    arm64) \
      uds_arch="arm64"; \
      uds_sha="4b47cbe25480c8b2fcb3c864ca6ffe226a67b65c47fa5acb7d11ebf9f2bb8169"; \
      zarf_arch="arm64"; \
      zarf_sha="c4239a4947e680a1a8e5e1a4a2db6a7d921265ad1aa85aeb1d6cd18d8bb67e60"; \
      ;; \
    *) echo "Unsupported TARGETARCH=${TARGETARCH:-amd64}" >&2; exit 1 ;; \
  esac \
  && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/${TARGETARCH:-amd64}/kubectl" -o /usr/local/bin/kubectl \
  && curl -fsSL "https://github.com/defenseunicorns/uds-cli/releases/download/v${UDS_VERSION}/uds-cli_v${UDS_VERSION}_Linux_${uds_arch}" -o /usr/local/bin/uds \
  && echo "${uds_sha}  /usr/local/bin/uds" | sha256sum -c - \
  && curl -fsSL "https://github.com/zarf-dev/zarf/releases/download/v${ZARF_VERSION}/zarf_v${ZARF_VERSION}_Linux_${zarf_arch}" -o /usr/local/bin/zarf \
  && echo "${zarf_sha}  /usr/local/bin/zarf" | sha256sum -c - \
  && chmod +x /usr/local/bin/kubectl /usr/local/bin/uds /usr/local/bin/zarf

COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/tsconfig.json ./shared/
COPY components/backend/package.json components/backend/tsconfig.json ./components/backend/

RUN npm install

COPY shared ./shared
COPY components/backend ./components/backend

RUN npm run build -w @uds-poc/shared && npm run build -w @uds-poc/backend

EXPOSE 3001

CMD ["npm", "run", "start", "-w", "@uds-poc/backend"]
