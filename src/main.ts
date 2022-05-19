import { match, MatchFunction, MatchResult } from "path-to-regexp";
import { handleImportMap } from "./handleImportMap";
import { notFoundResponse } from "./responseUtils";
import { handleApps } from "./handleApps";
import { startupChecks } from "./startupChecks";
import { handleOptions } from "./cors";

addEventListener("fetch", (evt: FetchEvent) => {
  evt.respondWith(handleRequest(evt.request));
});

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

let routeMatchers: RouteMatchers;
updateRouteMatchers();

export function updateRouteMatchers() {
  let routeHandlers: RouteHandlers;

  if (BASEPLATE_ENV === "dev") {
    routeHandlers = devRouteHandlers;
  } else if (BASEPLATE_ENV === "test") {
    routeHandlers = testRouteHandlers;
  } else {
    routeHandlers = prodRouteHandlers;
  }

  routeMatchers = Object.entries(routeHandlers).map(([path, handler]) => [
    match(path),
    handler,
  ]);
}

startupChecks();

const allowedMethods = ["GET", "HEAD", "OPTIONS"];

export async function handleRequest(request: Request) {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  } else if (!allowedMethods.includes(request.method)) {
    return notFoundResponse(request);
  }

  const requestUrl = new URL(request.url);

  let routeHandler: RouteHandler | undefined,
    matchResult: MatchResult | false = false;

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

  if (routeHandler && matchResult) {
    const params = {
      customerEnv: "prod",
      ...matchResult.params,
    };
    return routeHandler(request, params);
  } else {
    return notFoundResponse(request);
  }
}

type RouteMatchers = RouteMatcher[];

type RouteMatcher = [MatchFunction, RouteHandler];

interface RouteHandlers {
  [path: string]: RouteHandler;
}

type RouteHandler = (request: Request, params: object) => Promise<Response>;
