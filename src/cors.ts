import { OrgSettings } from "./getOrgSettings";
import { pathToRegexp } from "path-to-regexp";

const orgKeyRegex = pathToRegexp("/:orgKey");
const invalidOrgKeys = ["npm"];

// OPTIONS HTTP requests are CORS preflight requests
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests
// Based on https://developers.cloudflare.com/workers/examples/cors-header-proxy,
// but rewritten for our specific needs
export async function handleOptions(request: Request): Promise<Response> {
  const match = orgKeyRegex.exec(new URL(request.url).pathname);
  if (match) {
    const [fullMatch, orgKey] = match;
    if (orgKey && !invalidOrgKeys.includes(orgKey)) {
    } else {
      // We don't know which
    }
  } else {
    return new Response();
  }

  return new Response(null);
}

export function unknownOrgCorsHeaders() {}

export function orgCorsHeaders(
  request: Request,
  orgSettings: OrgSettings
): HeadersInit {
  return {};
  // if (request.orig)

  // return {
  //   'access-control-'
  // }
}
