import { match, MatchFunction, MatchResult } from "path-to-regexp";
import { handleImportMap } from "./handleImportMap";
import { notFoundResponse } from "./responseUtils";

addEventListener("fetch", (evt: FetchEvent) => {
  evt.respondWith(handleRequest(evt.request));
});

const prodRouteHandlers: RouteHandlers = {
  "/:orgKey/:importMapName.importmap": handleImportMap,
};

const testRouteHandlers: RouteHandlers = {
  "/:orgKey/:envName/:importMapName.importmap": handleImportMap,
};

const devRouteHandlers: RouteHandlers = {
  ...prodRouteHandlers,
  ...testRouteHandlers,
};

let routeMatchers: RouteMatchers;
updateRouteMatchers();

export function updateRouteMatchers() {
  let routeHandlers: RouteHandlers;

  if (FOUNDRY_ENV === "dev") {
    routeHandlers = devRouteHandlers;
  } else if (FOUNDRY_ENV === "test") {
    routeHandlers = testRouteHandlers;
  } else {
    routeHandlers = prodRouteHandlers;
  }

  routeMatchers = Object.entries(routeHandlers).map(([path, handler]) => [
    match(path),
    handler,
  ]);
}

export async function handleRequest(request: Request) {
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
    return routeHandler(request, matchResult.params);
  } else {
    return notFoundResponse();
  }
}

type RouteMatchers = RouteMatcher[];

type RouteMatcher = [MatchFunction, RouteHandler];

interface RouteHandlers {
  [path: string]: RouteHandler;
}

type RouteHandler = (request: Request, params: object) => Promise<Response>;
