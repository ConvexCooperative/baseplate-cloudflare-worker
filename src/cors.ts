import { getOrgSettings, OrgSettings } from "./getOrgSettings";
import { pathToRegexp } from "path-to-regexp";
import { isDefined } from "lodash-es";

const orgKeyRegex = pathToRegexp("/:orgKey");
const invalidOrgKeys = ["npm"];

// OPTIONS HTTP requests are CORS preflight requests
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests
// Based on https://developers.cloudflare.com/workers/examples/cors-header-proxy,
// but rewritten for our specific needs
export async function handleOptions(request: Request): Promise<Response> {
  const match = orgKeyRegex.exec(new URL(request.url).pathname);
  const orgKey = match && match[1];

  if (orgKey && !invalidOrgKeys.includes(orgKey)) {
    const orgSettings = await getOrgSettings(orgKey);

    if (orgSettings.orgExists) {
      return orgCorsResponse(request, orgSettings);
    }
  }

  // We don't know which org this request is for
  return unknownOrgCorsResponse();
}

export function unknownOrgCorsResponse(): Response {
  const body = null;

  return new Response(body, {
    // When there is no org key, let no cors request through
    headers: {},
  });
}

export function orgCorsResponse(
  request: Request,
  orgSettings: OrgSettings
): Response {
  const body = null;
  const headers: HeadersInit = {};
  const requestOrigin = request.headers["Origin"] || request.headers["origin"];
  const requestFromValidOrigin =
    orgSettings.cors.allowOrigins.includes("*") ||
    (requestOrigin && orgSettings.cors.allowOrigins.includes(requestOrigin));

  if (requestFromValidOrigin) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
  }

  if (orgSettings.cors.exposeHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] =
      orgSettings.cors.exposeHeaders.join(", ");
  }

  if (isDefined(orgSettings.cors.maxAge)) {
    headers["Access-Control-Max-Age"] = orgSettings.cors.maxAge.toString();
  }

  if (isDefined(orgSettings.cors.allowCredentials)) {
    headers["Access-Control-Allow-Credentials"] = new Boolean(
      orgSettings.cors.allowCredentials
    ).toString();
  }

  if (orgSettings.cors.allowMethods.length > 0) {
    headers["Access-Control-Allow-Methods"] =
      orgSettings.cors.allowMethods.join(", ");
  }

  if (orgSettings.cors.allowHeaders.length > 0) {
    headers["Access-Control-Allow-Headers"] =
      orgSettings.cors.allowHeaders.join(", ");
  }

  return new Response(body, {
    headers,
  });
}
