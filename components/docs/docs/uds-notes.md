# macOS UDS Deploy Workaround

This document exists so future agents do not rediscover or accidentally remove the local macOS workaround.

## Start With Seccomp

The workaround starts with the k3d/kubelet/container runtime seccomp failure, not with ingress.

Known upstream issue: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237)

Failure signature:

```text
CoreDNS stuck in ContainerCreating
FailedCreatePodSandBox
failed to generate seccomp spec opts: seccomp is not supported
```

What happened:

- `uds deploy k3d-core-demo:latest` creates its own k3d cluster.
- A manually-created k3d cluster with `--kubelet-arg=seccomp-default=false` does not help that official deploy path because the UDS-created cluster does not inherit those flags.
- CoreDNS then cannot create a pod sandbox, so the deploy waits and eventually fails before Core can become useful for this POC.

The official deploy remains the preferred path when the active Docker runtime supports seccomp:

```bash
make deploy-uds
```

Use the workaround only when the official path repeatedly fails with the seccomp signature:

```bash
make deploy-uds-macos
```

## What The Workaround Does

`make deploy-uds-macos` runs `scripts/uds/deploy-uds-macos-workaround.sh`.

The script:

- Deletes and recreates the local k3d cluster named `uds`.
- Creates the cluster with `--kubelet-arg=seccomp-default=false@server:0`.
- Adds one k3d agent by default.
- Maps local ports `80` and `443` through the k3d load balancer.
- Disables the default k3s Traefik addon.
- Disables k3s ServiceLB.
- Waits for CoreDNS.
- Deploys selected non-cluster packages from `k3d-core-slim-dev:latest`.
- Skips `uds-k3d-dev` so the bundle does not delete/recreate the cluster without the seccomp flag.
- Patches UDS Core gateway `LoadBalancer` service status to `127.0.0.1` while deploy waits are running.
- Patches the k3d server load balancer so host `80` and `443` route to UDS tenant/admin gateway NodePorts.
- Prints phase banners and a deploy heartbeat while the long-running UDS deploy phase is active.
- Verifies the cluster and installed Package CRs when deploy completes.

The deploy heartbeat defaults to once every 60 seconds. Override it when debugging:

```bash
UDS_DEPLOY_PROGRESS_INTERVAL_SECONDS=30 make deploy-uds-macos
```

## Why ServiceLB Is Disabled

k3s ServiceLB creates `svclb-*` pods for `LoadBalancer` services.

UDS Core creates multiple gateway `LoadBalancer` services. In this local k3d workaround, those `svclb-*` pods can compete for host ports `80` and `443`, leaving gateway load balancer pods pending and causing later deploy waits to stall.

Disabling ServiceLB avoids that port fight.

## Why Gateway Status Is Patched

Once ServiceLB is disabled, nothing assigns an external IP to the gateway `LoadBalancer` services.

Some UDS/Core package waits expect those services to have a `status.loadBalancer.ingress` value. The workaround patches only service status, not service spec:

```text
status.loadBalancer.ingress[0].ip = 127.0.0.1
```

That keeps deploy waits moving in the local POC cluster.

## Why Gateway Routing Is Patched

Disabling ServiceLB prevents local `svclb-*` host-port conflicts, but it also means the UDS gateway `LoadBalancer` services do not own host `80` or `443`.

k3d still exposes host `80` and `443` through its `serverlb` container. By default, that container forwards to node `80` and `443`, while the UDS gateway services are actually reachable on allocated NodePorts. The workaround patches the k3d `serverlb` nginx config after Core deploys:

- HTTP `*.uds.dev` -> tenant gateway HTTP NodePort.
- HTTPS `*.uds.dev` -> tenant gateway HTTPS NodePort using SNI preread.
- HTTP `*.admin.uds.dev` -> admin gateway HTTP NodePort.
- HTTPS `*.admin.uds.dev` -> admin gateway HTTPS NodePort using SNI preread.
- Kubernetes API `6443` remains forwarded to the k3d server node.

This is cluster-level routing. It should not need to run again for each app package pushed to the local registry; new apps add UDS/Istio routes behind the already-wired tenant gateway.

## Do Not Replace This With NodePort

Do not patch the gateway services to `NodePort`.

That was tried and UDS Core policy rejected it:

```text
admission webhook "pepr-uds-core.pepr.dev" denied the request: NodePort services are not allowed.
```

The status patch is intentionally less invasive than changing the service type.

## What This Does Not Prove

This workaround is local and experimental.

It does not fully replace `uds-k3d-dev` because it does not:

- Preload the full UDS k3d airgap image set.
- Reproduce every cluster bootstrap action from the `uds-k3d-dev` package.
- Establish a production registry publish/deploy promotion workflow.
- Establish a package signature verification workflow.

This does not mean a local registry is impossible. A local OCI registry is required for testing real app packages end to end. It should let the repo package/push a UDS or Zarf app package locally, point the backend at that local OCI reference or catalog export, deploy from that source, and verify the installed Package CR count/status. That is different from proving a production registry workflow with auth, promotion, signatures, and long-lived catalog indexing.

For this POC, the immediate success condition is narrower:

- Kubernetes is reachable.
- UDS Core packages deploy.
- Installed Zarf Package CRs exist and can be read with:

```bash
uds zarf tools kubectl get package -A -o json
```

That gets the frontend/backend close to the end goal of showing deployed package count and status from the cluster.

The data model should stay split the same way when local registry support is added:

- Available local registry packages remain `RegistryPackage` records.
- Deployed cluster packages remain `InstalledPackage` records read from Package CRs.
- A future launch/install flow connects them through OCI reference, package name, version/tag, architecture/flavor, variables, and backend-generated install/deploy actions.

## Debug And Cleanup

Use this while deploy appears stuck:

```bash
make uds-debug
```

If a live-edited workaround run leaves the gateway status watcher printing after deploy is complete, stop only the stale watcher/process:

```bash
make stop-uds-workaround
```

For a clean retry:

```bash
make down
make deploy-uds-macos
```
