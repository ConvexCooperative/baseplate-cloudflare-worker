import {
  match,
  MatchFunction,
  MatchResult,
  pathToRegexp,
} from "path-to-regexp";
import { handleImportMap } from "./handleImportMap";
import {
  notFoundResponse,
  internalErrorResponse,
  isCustomDomain,
} from "./responseUtils";
import { handleApps } from "./handleApps";
import { handleOptions } from "./cors";
import { logRequest, RequestLog } from "./logRequests";

const workerHandler: ExportedHandler<EnvVars> = {
  fetch: handleRequest,
};

export default workerHandler;

const prodRouteHandlers: RouteHandlers = withOptionalOrgKey({
  "/:importMapName.importmap": handleImportMap,
  "/apps/:pathParts*": handleApps,
});

const testRouteHandlers: RouteHandlers = withOptionalOrgKey({
  "/:customerEnv/:importMapName.importmap": handleImportMap,
  "/:customerEnv/apps/:pathParts*": handleApps,
});

const devRouteHandlers: RouteHandlers = {
  ...prodRouteHandlers,
  ...testRouteHandlers,
};

function withOptionalOrgKey(routeHandlers: RouteHandlers) {
  const result = {};
  for (const routeHandler in routeHandlers) {
    result[routeHandler] = routeHandlers[routeHandler];
    result["/:orgKey" + routeHandler] = routeHandlers[routeHandler];
  }

  return result;
}

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

const requiredEnvironmentVariables: string[] = [
  "BASEPLATE_ENV",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "TIMESTREAM_DATABASE",
  "TIMESTREAM_TABLE",
  "MAIN_KV",
];

const orgKeyRegex = pathToRegexp("/:orgKey/(.*)");

export async function handleRequest(
  request: Request,
  env: EnvVars,
  context: ExecutionContext
) {
  const missingEnvVars = requiredEnvironmentVariables.filter(
    (requiredVar) => !env[requiredVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `Missing environment variables '${missingEnvVars.join(", ")}'`
    );
    return internalErrorResponse(request);
  }

  const requestUrl = new URL(request.url);
  let orgKey: string | undefined;
  if (isCustomDomain(requestUrl.hostname)) {
    const kvKey = `custom-domain-${requestUrl.hostname}`;
    orgKey =
      (await env.MAIN_KV.get(kvKey, {
        type: "text",
      })) ?? undefined;
  } else {
    const match = orgKeyRegex.exec(requestUrl.pathname);
    orgKey = match && match[1] ? match[1] : undefined;
  }

  if (request.method === "OPTIONS") {
    return handleOptions(request, env, orgKey);
  } else if (!allowedMethods.includes(request.method)) {
    return notFoundResponse(request);
  }

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
    response = await routeHandler(request, params, requestLog, env, orgKey);
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
  env: EnvVars,
  orgKey?: string
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
