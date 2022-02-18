import { match, MatchFunction, MatchResult } from "path-to-regexp";
import { handleImportMap } from "./handleImportMap";
import { notFoundResponse } from "./responseUtils";

addEventListener("fetch", (evt: FetchEvent) => {
  evt.respondWith(handleRequest(evt.request));
});

const routeHandlers: RouteHandlers = {
  "/:orgKey/:importMapName.importmap": handleImportMap,
};

const routeMatchers: RouteMatchers = Object.entries(routeHandlers).map(
  ([path, handler]) => [match(path), handler]
);

async function handleRequest(request: Request) {
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
