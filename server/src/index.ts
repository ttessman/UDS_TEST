import "dotenv/config";
import cors from "cors";
import express from "express";
import type {
  HealthResponse,
  InstallRequestBody,
  InstallResponse,
  InstalledPackagesResponse,
  PackagesResponse,
  UdsStatus
} from "@uds-poc/shared";
import { getInstalledPackageProxyTarget, getInstalledPackages, getRegistryPackages, getUdsStatus, installPackage } from "./udsService.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const response: HealthResponse = {
    ok: true,
    service: "uds-core-local-poc",
    time: new Date().toISOString()
  };
  res.json(response);
});

app.get("/api/uds/status", async (_req, res, next) => {
  try {
    const response: UdsStatus = await getUdsStatus();
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/uds/packages", async (_req, res, next) => {
  try {
    const response: PackagesResponse = await getRegistryPackages();
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/uds/installed-packages", async (_req, res, next) => {
  try {
    const response: InstalledPackagesResponse = await getInstalledPackages();
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.use<{ namespace: string; name: string }>(
  "/api/uds/apps/:namespace/:name/proxy",
  async (req, res, next) => {
    try {
      const target = await getInstalledPackageProxyTarget(req.params.namespace, req.params.name);
      const upstreamPath = req.url === "/" ? "/" : req.url;
      const upstream = await fetch(`http://127.0.0.1:${target.localPort}${upstreamPath}`, {
        method: req.method,
        headers: proxyHeaders(req.headers),
        body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body)
      });

      res.status(upstream.status);
      upstream.headers.forEach((value, key) => {
        if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  }
);

app.post<{ id: string }, InstallResponse, InstallRequestBody>(
  "/api/uds/packages/:id/install",
  async (req, res, next) => {
    try {
      const result = await installPackage(req.params.id);
      res.json({
        accepted: Boolean(result.result?.ok),
        packageId: req.params.id,
        command: result.command,
        result: result.result,
        error: result.error
      });
    } catch (error) {
      next(error);
    }
  }
);

function proxyHeaders(headers: express.Request["headers"]): Headers {
  const forwarded = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase() === "host" || value == null) {
      return;
    }

    forwarded.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  return forwarded;
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`UDS Core local POC server listening on http://localhost:${port}`);
});
