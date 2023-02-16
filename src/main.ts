import { match, MatchFunction, MatchResult } from "path-to-regexp";
import { handleImportMap } from "./handleImportMap";
import { notFoundResponse } from "./responseUtils";
import { handleApps } from "./handleApps";
import { handleOptions } from "./cors";
import { logRequest, RequestLog } from "./logRequests";

const workerHandler: ExportedHandler<EnvVars> = {
  fetch: handleRequest,
};

export default workerHandler;

const prodRouteHandlers: RouteHandlers = {
  "/:orgKey/:importMapName.importmap": handleImportMap,
  "/:orgKey/apps/:pathParts*": handleApps,
};

const testRouteHandlers: RouteHandlers = {
  "/:orgKey/:customerEnv/:importMapName.importmap": handleImportMap,
  "/:orgKey/:customerEnv/apps/:pathParts*": handleApps,
};

const devRouteHandlers: RouteHandlers = {
  ...prodRouteHandlers,
  ...testRouteHandlers,
};

export function getRouteMatchers(env: EnvVars): RouteMatchers {
  let routeHandlers: RouteHandlers;

  if (env.BASEPLATE_ENV === "dev") {
    routeHandlers = devRouteHandlers;
  } else if (env.BASEPLATE_ENV === "test") {
    routeHandlers = testRouteHandlers;
  } else {
    routeHandlers = prodRouteHandlers;
  }

  return Object.entries(routeHandlers).map(([path, handler]) => [
    match(path),
    handler,
  ]);
}

const allowedMethods = ["GET", "HEAD", "OPTIONS"];

export async function handleRequest(
  request: Request,
  env: EnvVars,
  context: ExecutionContext
) {
  if (request.method === "OPTIONS") {
    return handleOptions(request, env);
  } else if (!allowedMethods.includes(request.method)) {
    return notFoundResponse(request);
  }

  const requestUrl = new URL(request.url);

  let routeHandler: RouteHandler | undefined,
    matchResult: MatchResult | false = false;

  const routeMatchers = getRouteMatchers(env);
  // Find which route handler to call for this request
  // We don't have express to do this automatically for us, but are
  // using path-to-regexp which is what express uses under the hood
  for (let routeMatcher of routeMatchers) {
    const [match, handler] = routeMatcher;
    matchResult = match(requestUrl.pathname);
    if (matchResult) {
      routeHandler = handler;
      break;
    }
  }

  let response: Response,
    requestLog: RequestLog = {
      customerEnv: "unknown",
      requestPath: requestUrl.pathname,
      timestamp: Date.now(),
      userAgent: request.headers.get("user-agent"),
      httpStatus: 0,
    };

  if (routeHandler && matchResult) {
    const params = {
      customerEnv: "prod",
      orgKey: undefined,
      ...matchResult.params,
    };
    requestLog.customerEnv = params.customerEnv;
    requestLog.orgKey = params.orgKey;
    response = await routeHandler(request, params, requestLog, env);
  } else {
    response = await notFoundResponse(request);
  }

  requestLog.httpStatus = response.status;

  context.waitUntil(logRequest(requestLog, env));
  return response;
}

type RouteMatchers = RouteMatcher[];

type RouteMatcher = [MatchFunction, RouteHandler];

interface RouteHandlers {
  [path: string]: RouteHandler;
}

type RouteHandler = (
  request: Request,
  params: object,
  requestLog: RequestLog,
  env: EnvVars
) => Promise<Response>;

export interface EnvVars {
  BASEPLATE_ENV: "dev" | "test" | "prod";
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  TIMESTREAM_DATABASE: string;
  TIMESTREAM_TABLE: string;
  MAIN_KV: KVNamespace;
}
