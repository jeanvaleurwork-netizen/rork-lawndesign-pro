import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

console.log("\n" + "=".repeat(60));
console.log("[Hono] Creating Hono app instance v6");
console.log("[Hono] tRPC Router structure:", Object.keys(appRouter._def.procedures || {}));
console.log("[Hono] Checking router._def:", Object.keys(appRouter._def));
console.log("[Hono] Router type:", typeof appRouter);

try {
  const router = appRouter as any;
  if (router.data) {
    console.log("[Hono] ✓ data router found");
    console.log("[Hono] data procedures:", Object.keys(router.data._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ data router NOT found");
  }
  if (router.aiIntake) {
    console.log("[Hono] ✓ aiIntake router found");
    console.log("[Hono] aiIntake procedures:", Object.keys(router.aiIntake._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ aiIntake router NOT found");
  }
  if (router.auth) {
    console.log("[Hono] ✓ auth router found");
    console.log("[Hono] auth procedures:", Object.keys(router.auth._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ auth router NOT found");
  }
  if (router.gemini) {
    console.log("[Hono] ✓ gemini router found");
    console.log("[Hono] gemini procedures:", Object.keys(router.gemini._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ gemini router NOT found");
  }
  if (router.contracts) {
    console.log("[Hono] ✓ contracts router found");
    console.log("[Hono] contracts procedures:", Object.keys(router.contracts._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ contracts router NOT found");
  }
  if (router.smartContracts) {
    console.log("[Hono] ✓ smartContracts router found");
    console.log("[Hono] smartContracts procedures:", Object.keys(router.smartContracts._def?.procedures || {}));
  } else {
    console.log("[Hono] ✗ smartContracts router NOT found");
  }
} catch (e) {
  console.error("[Hono] Error inspecting router:", e);
}

console.log("=".repeat(60) + "\n");

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use("*", async (c, next) => {
  console.log("[Hono] Incoming request:", c.req.method, c.req.url);
  await next();
  console.log("[Hono] Response status:", c.res.status);
});

console.log("[Hono] Registering tRPC server at /api/trpc");
console.log("[Hono] Router procedures:", Object.keys((appRouter as any)._def.procedures || {}));
console.log("[Hono] Router has aiIntake:", Boolean((appRouter as any).aiIntake));

app.all("/api/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error("[tRPC Server Error] Path:", path);
      console.error("[tRPC Server Error] Error:", error);
    },
  });
  return response;
});

app.get("/", (c) => {
  console.log("[Hono] Health check at /");
  return c.json({ status: "ok", message: "ContractorOS API is running" });
});

app.get("/api", (c) => {
  console.log("[Hono] Health check at /api");
  
  const router = appRouter as any;
  const routerInfo: Record<string, any> = {};
  
  try {
    if (router._def && router._def.procedures) {
      const topLevelProcedures = Object.keys(router._def.procedures);
      routerInfo.topLevel = topLevelProcedures;
    }
    
    const checkRouter = (name: string) => {
      if (router[name] && router[name]._def && router[name]._def.procedures) {
        return Object.keys(router[name]._def.procedures);
      }
      return [];
    };
    
    routerInfo.auth = checkRouter('auth');
    routerInfo.gemini = checkRouter('gemini');
    routerInfo.aiIntake = checkRouter('aiIntake');
    routerInfo.data = checkRouter('data');
    routerInfo.ai = checkRouter('ai');
    routerInfo.pagosAI = checkRouter('pagosAI');
    routerInfo.receiptAI = checkRouter('receiptAI');
    routerInfo.contracts = checkRouter('contracts');
    routerInfo.smartContracts = checkRouter('smartContracts');
  } catch (e) {
    console.error("[Hono] Error extracting router info:", e);
  }
  
  return c.json({ 
    status: "ok", 
    message: "ContractorOS API is running", 
    version: "v5",
    timestamp: new Date().toISOString(),
    trpcEndpoint: "/api/trpc",
    availableRoutes: routerInfo,
    routerStructure: {
      hasAuth: Boolean(router.auth),
      hasGemini: Boolean(router.gemini),
      hasAiIntake: Boolean(router.aiIntake),
      hasData: Boolean(router.data),
      hasContracts: Boolean(router.contracts),
      hasSmartContracts: Boolean(router.smartContracts),
    }
  });
});

app.get("/api/test-trpc", (c) => {
  console.log("[Hono] Test tRPC endpoint called");
  const router = appRouter as any;
  return c.json({
    message: "tRPC Test Endpoint",
    aiIntakeExists: Boolean(router.aiIntake),
    aiIntakeProcedures: router.aiIntake ? Object.keys(router.aiIntake._def?.procedures || {}) : [],
    authExists: Boolean(router.auth),
    authProcedures: router.auth ? Object.keys(router.auth._def?.procedures || {}) : [],
  });
});

app.onError((err, c) => {
  console.error("[Backend Error]", err);
  return c.json({ error: err.message }, 500);
});

app.notFound((c) => {
  console.error("[Hono] 404 Not Found:", c.req.url, c.req.method);
  return c.json({ error: "Not Found", url: c.req.url, method: c.req.method }, 404);
});

console.log("[Hono] Backend app configured and ready");

export default app;
