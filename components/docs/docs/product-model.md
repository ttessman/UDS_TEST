---
sidebar_position: 3
---

# Product Model

The catalog separates what is available from what is running.

## Store Packages

Store entries come from registry and OCI/Zarf package metadata. In code, these are modeled as `RegistryPackage`.

They answer:

- What packages can this environment install?
- What version, tag, architecture, or description is known?
- Is there an install action the backend can safely run?

## Installed Resources

Installed resources come from Kubernetes Package custom resources. In code, these are modeled as `InstalledPackage`.

They answer:

- What is actually deployed in the cluster?
- Is it ready?
- Which namespace owns it?
- What endpoints can users launch?

## Actions

Normal users launch applications from discovered endpoints. Admin-style users can install, undeploy, publish, or unpublish package entries when the backend marks those actions as supported.

The browser never needs direct registry credentials, kubeconfig access, or local UDS CLI access. The backend owns those boundaries.
