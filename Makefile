SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: help up up/backend up/frontend up/docs up/catalog-poc ports build build/backend build/frontend build/docs build/catalog-poc push/apps push/docs push/catalog-poc check-prereqs check-run-ready setup setup-macos deploy-uds deploy-core deploy-uds-macos fix-uds-ports fix-uds-gateway-routing refresh-uds-gateways stop-uds-workaround down down-deploy down-uds setup-local-demo verify-uds uds-debug inspect-packages installed-packages registry-up registry-down package-platform publish-platform deploy-platform package-docs publish-docs deploy-docs package-catalog-poc publish-catalog-poc deploy-catalog-poc verify-catalog-poc git-status

help:
	@printf "UDS  local POC commands\n\n"
	@printf "Official path from fresh checkout:\n"
	@printf "  make setup && make deploy-uds && make build && make up\n"
	@printf "  make build/catalog-poc && make up/catalog-poc\n"
	@printf "macOS workaround path:\n"
	@printf "  make setup && make deploy-uds-macos && make build && make up\n"
	@printf "  make build/catalog-poc && make up/catalog-poc\n\n"
	@printf "Setup:\n"
	@printf "  make setup               Set up local tools, npm dependencies, and env file\n"
	@printf "  make deploy-uds          Deploy and verify the official UDS  local demo\n"
	@printf "  make deploy-uds-macos    Experimental macOS seccomp workaround deploy\n"
	@printf "  make fix-uds-ports       Clean project k3d leftovers and re-check ports 80/443\n"
	@printf "  make fix-uds-gateway-routing Patch k3d host 80/443 to UDS gateway NodePorts\n"
	@printf "  make refresh-uds-gateways Restart UDS gateways to refresh local Istio route certificates\n"
	@printf "  make stop-uds-workaround Stop a stale macOS workaround deploy/watcher process\n"
	@printf "  make down                Remove app deploys, delete local UDS/k3d cluster, and remove local registry\n"
	@printf "  make down-deploy         Remove repo-deployed sample apps only\n"
	@printf "  make down-uds            Delete local UDS/k3d cluster, registry, and review shared gateway ports\n"
	@printf "  make setup-macos         Check/install local CLI prerequisites only\n"
	@printf "  make setup-local-demo    Alias for deploy-uds\n"
	@printf "  make check-prereqs       Print local tool prerequisite status\n\n"
	@printf "Run:\n"
	@printf "  make up                  Push/package/publish/deploy built platform and docs images, then port-forward them\n"
	@printf "  make up/frontend         Redeploy the platform package and wait for frontend rollout\n"
	@printf "  make up/backend          Redeploy the platform package and wait for backend rollout\n"
	@printf "  make up/docs             Publish/deploy the docs package and wait for docs rollout\n"
	@printf "  make up/catalog-poc      Publish/deploy the built catalog-poc sample app package\n"
	@printf "  make ports               Port-forward already-deployed frontend/backend/docs services\n"
	@printf "  Component-local dev commands live in components/*/Makefile\n\n"
	@printf "Verify/build:\n"
	@printf "  make build               Build all frontend/backend/docs container images\n"
	@printf "  make build/backend       Build only the backend container image\n"
	@printf "  make build/frontend      Build only the frontend container image\n"
	@printf "  make build/docs          Build only the docs container image\n"
	@printf "  make build/catalog-poc   Build only the catalog-poc sample app container image\n"
	@printf "  make check-run-ready     Verify setup completed before deploying/port-forwarding POC apps\n"
	@printf "  make verify-uds          Verify UDS CLI, cluster reachability,  namespace, Package CRs\n"
	@printf "  make uds-debug           Print a focused UDS/k3d deploy debugging snapshot\n\n"
	@printf "UDS/Zarf helpers:\n"
	@printf "  make inspect-packages    Inspect configured UDS_REGISTRY_PACKAGE_REFS\n"
	@printf "  make installed-packages  Print installed Zarf Package CRs\n"
	@printf "  make registry-up         Start local OCI registry on localhost:5001\n"
	@printf "  make registry-down       Remove the local OCI registry container\n"
	@printf "  make push/apps           Push frontend/backend platform images to the local OCI registry\n"
	@printf "  make push/docs           Push the docs image to the local OCI registry\n"
	@printf "  make push/catalog-poc    Push the catalog-poc image to the local OCI registry\n"
	@printf "  make package-platform    Create the frontend/backend platform Zarf package from already-built images\n"
	@printf "  make publish-platform    Publish frontend/backend platform Zarf package to local OCI\n"
	@printf "  make deploy-platform     Deploy frontend/backend platform package to Kubernetes\n"
	@printf "  make package-docs        Create the docs Zarf package from the built docs image\n"
	@printf "  make publish-docs        Publish docs to the local OCI registry\n"
	@printf "  make deploy-docs         Deploy docs package to Kubernetes\n"
	@printf "  make package-catalog-poc Create the minimal catalog-poc Zarf package from the built image\n"
	@printf "  make publish-catalog-poc Publish catalog-poc to the local OCI registry\n"
	@printf "  make deploy-catalog-poc  Compatibility one-shot for build/catalog-poc + up/catalog-poc\n"
	@printf "  make verify-catalog-poc  Verify catalog-poc rollout and UDS Package endpoint\n"
	@printf "  make deploy-core     Deploy official k3d-core-demo UDS Core bundle\n\n"

up: check-run-ready deploy-platform deploy-docs refresh-uds-gateways ports

up/backend: check-run-ready publish-platform
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/deploy-zarf-package.sh "$${UDS_POC_PLATFORM_PACKAGE_ARCHIVE}" "$${UDS_POC_PLATFORM_NAMESPACE}" backend
	@source ./scripts/vars/load-vars.sh; ./scripts/package/restart-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" backend
	@source ./scripts/vars/load-vars.sh; ./scripts/package/wait-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" backend
	./scripts/uds/refresh-uds-gateways.sh

up/frontend: check-run-ready publish-platform
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/deploy-zarf-package.sh "$${UDS_POC_PLATFORM_PACKAGE_ARCHIVE}" "$${UDS_POC_PLATFORM_NAMESPACE}" frontend
	@source ./scripts/vars/load-vars.sh; ./scripts/package/restart-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" frontend
	@source ./scripts/vars/load-vars.sh; ./scripts/package/wait-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" frontend
	./scripts/uds/refresh-uds-gateways.sh

up/docs: check-run-ready deploy-docs refresh-uds-gateways

up/catalog-poc: check-run-ready publish-catalog-poc
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/deploy-zarf-package.sh "$${CATALOG_POC_OCI_REF}" "$${CATALOG_POC_NAMESPACE}" "$${CATALOG_POC_NAME}"
	./scripts/debug/verify-catalog-poc.sh
	./scripts/uds/refresh-uds-gateways.sh

ports:
	./scripts/up/run-uds-poc-apps.sh

build:
	./scripts/build/build-uds-poc-image.sh all

build/backend:
	./scripts/build/build-uds-poc-image.sh backend

build/frontend:
	./scripts/build/build-uds-poc-image.sh frontend

build/docs:
	./scripts/build/build-uds-poc-image.sh docs

build/catalog-poc:
	./scripts/build/build-catalog-poc-image.sh

check-prereqs:
	./scripts/setup/check-prereqs.sh

check-run-ready:
	./scripts/debug/check-run-ready.sh

setup-macos:
	./scripts/setup/setup-macos.sh

setup:
	@echo "Setup phase 1/3: local CLI prerequisites"
	UDS_POC_FULL_SETUP=true ./scripts/setup/setup-macos.sh
	@echo "Setup phase 2/3: npm dependencies"
	npm install
	@echo "Setup phase 3/3: local environment file"
	@if [ ! -f components/backend/.env ]; then cp components/backend/.env.example components/backend/.env; echo "Created components/backend/.env"; else echo "components/backend/.env already exists"; fi
	@echo "Local setup complete. Next: make deploy-uds"

deploy-uds: registry-up
	@echo "UDS deploy: official UDS Core local demo"
	$(MAKE) deploy-core
	@echo "UDS deploy complete. Next: make build && make up"
	@echo "Then, in another terminal: make build/catalog-poc && make up/catalog-poc"

deploy-uds-macos: registry-up
	./scripts/uds/deploy-uds-macos-workaround.sh

fix-uds-ports:
	./scripts/uds/fix-uds-ports.sh

fix-uds-gateway-routing:
	./scripts/uds/fix-uds-gateway-routing.sh

refresh-uds-gateways:
	./scripts/uds/refresh-uds-gateways.sh

stop-uds-workaround:
	./scripts/uds/stop-uds-workaround.sh

down:
	$(MAKE) down-deploy
	$(MAKE) down-uds

down-deploy:
	./scripts/cleanup/down-deploy.sh

down-uds:
	./scripts/cleanup/down-uds.sh

setup-local-demo: deploy-uds

verify-uds:
	./scripts/debug/verify-uds.sh

uds-debug:
	./scripts/debug/uds-debug.sh

inspect-packages:
	./scripts/debug/inspect-packages.sh

installed-packages:
	uds zarf tools kubectl get package -A -o json

registry-up:
	./scripts/registry/registry-up.sh

registry-down:
	./scripts/registry/registry-down.sh

push/apps: registry-up
	@source ./scripts/vars/load-vars.sh; ./scripts/package/push-image.sh "$${UDS_POC_BACKEND_IMAGE}" "Run make build/backend first, or make build for all images."
	@source ./scripts/vars/load-vars.sh; ./scripts/package/push-image.sh "$${UDS_POC_FRONTEND_IMAGE}" "Run make build/frontend first, or make build for all images."

push/docs: registry-up
	@source ./scripts/vars/load-vars.sh; ./scripts/package/push-image.sh "$${DOCS_IMAGE}" "Run make build/docs first."

push/catalog-poc: registry-up
	@source ./scripts/vars/load-vars.sh; ./scripts/package/push-image.sh "$${CATALOG_POC_IMAGE}" "Run make build/catalog-poc first."

package-platform: registry-up push/apps
	@source ./scripts/vars/load-vars.sh; ZARF_PACKAGE_ARCH="$${UDS_POC_ARCH}" ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/package-zarf-dir.sh . "$${UDS_POC_PLATFORM_PACKAGE_ARCHIVE}"

publish-platform: package-platform
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/publish-zarf-package.sh "$${UDS_POC_PLATFORM_PACKAGE_ARCHIVE}" "oci://$${UDS_POC_REGISTRY}/$${UDS_POC_REPOSITORY}" "$${UDS_POC_PLATFORM_OCI_REF}"

deploy-platform: publish-platform
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/deploy-zarf-package.sh "$${UDS_POC_PLATFORM_PACKAGE_ARCHIVE}"
	@source ./scripts/vars/load-vars.sh; ./scripts/package/restart-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" backend frontend
	@source ./scripts/vars/load-vars.sh; ./scripts/package/wait-rollouts.sh "$${UDS_POC_PLATFORM_NAMESPACE}" backend frontend

package-docs: registry-up push/docs
	@source ./scripts/vars/load-vars.sh; ZARF_PACKAGE_ARCH="$${UDS_POC_ARCH}" ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/package-zarf-dir.sh "$${DOCS_PACKAGE_DIR}" "$${DOCS_PACKAGE_ARCHIVE}"

publish-docs: package-docs
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/publish-zarf-package.sh "$${DOCS_PACKAGE_ARCHIVE}" "oci://$${UDS_POC_REGISTRY}/$${UDS_POC_REPOSITORY}" "$${DOCS_OCI_REF}"

deploy-docs: publish-docs
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/deploy-zarf-package.sh "$${DOCS_OCI_REF}" "$${DOCS_NAMESPACE}" "$${DOCS_NAME}"
	@source ./scripts/vars/load-vars.sh; ./scripts/package/restart-rollouts.sh "$${DOCS_NAMESPACE}" "$${DOCS_NAME}"
	@source ./scripts/vars/load-vars.sh; ./scripts/package/wait-rollouts.sh "$${DOCS_NAMESPACE}" "$${DOCS_NAME}"

package-catalog-poc: registry-up push/catalog-poc
	@source ./scripts/vars/load-vars.sh; ZARF_PACKAGE_ARCH="$${UDS_POC_ARCH}" ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/package-zarf-dir.sh "$${CATALOG_POC_PACKAGE_DIR}" "$${CATALOG_POC_PACKAGE_ARCHIVE}"

publish-catalog-poc: package-catalog-poc
	@source ./scripts/vars/load-vars.sh; ZARF_PLAIN_HTTP="$${UDS_POC_PLAIN_HTTP}" ./scripts/package/publish-zarf-package.sh "$${CATALOG_POC_PACKAGE_ARCHIVE}" "oci://$${UDS_POC_REGISTRY}/$${UDS_POC_REPOSITORY}" "$${CATALOG_POC_OCI_REF}"

deploy-catalog-poc: build/catalog-poc up/catalog-poc

verify-catalog-poc:
	./scripts/debug/verify-catalog-poc.sh

deploy-core:
	./scripts/uds/deploy-uds-core.sh

git-status:
	git status --short
