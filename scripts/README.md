# Script Groups

Root Make targets are the supported entrypoint. Scripts are grouped by workflow purpose:

- Setup: `setup/`
- UDS cluster: `uds/`
- Build: `build/`
- Generic image/package operations: `package/`
- Runtime and port-forwarding: `up/`
- Verify and debug: `debug/`
- Cleanup: `cleanup/`
- Registry lifecycle: `registry/`
- Make/Zarf orchestration defaults: `vars/defaults.env` and `vars/load-vars.sh`

`vars/defaults.env` defines local Make/Zarf defaults for package name, namespace, image, OCI ref, and archive path. These are not container runtime env values; runtime config belongs in YAML. `vars/load-vars.sh` loads those defaults and computes derived values such as architecture and archive names. The files under `package/` are the generic machinery that can push, package, publish, deploy, or wait on any app when given those values.

Current package defaults:

```text
vars/defaults.env  editable local POC orchestration defaults
vars/load-vars.sh  computed exports consumed by Make/scripts
```

remove this readme after grouped.
