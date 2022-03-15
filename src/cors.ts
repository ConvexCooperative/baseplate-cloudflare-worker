import { getOrgSettings } from "./getOrgSettings";
import { OrgSettings } from "@single-spa-foundry/utils";
import { pathToRegexp } from "path-to-regexp";
import { isUndefined } from "lodash-es";

const orgKeyRegex = pathToRegexp("/:orgKey/(.*)");
const invalidOrgKeys = ["npm"];

// OPTIONS HTTP requests are CORS preflight requests
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests
// Based on https://developers.cloudflare.com/workers/examples/cors-header-proxy,
// but rewritten for our specific needs
export async function handleOptions(request: Request): Promise<Response> {
  const match = orgKeyRegex.exec(new URL(request.url).pathname);
  const orgKey = match && match[1];
  const body = null;
  let orgSettings;

  if (orgKey && !invalidOrgKeys.includes(orgKey)) {
    orgSettings = await getOrgSettings(orgKey);
  }

  return new Response(body, {
    status: 200,
    headers: corsHeaders(request, orgSettings),
  });
}

export function corsHeaders(
  request: Request,
  orgSettings?: OrgSettings
): HeadersInit {
  const noOrgSettings = !orgSettings || !orgSettings.orgExists;
  const requestOrigin = request.headers.get("origin");
  const serverOrigin = new URL(request.url).hostname;
  const sameOrigin = requestOrigin === serverOrigin;

  if (noOrgSettings || sameOrigin) {
    // When there are no org settings for the request, or when it's a same-origin request,
    // do not add any cors headers
    return {};
  }

  const headers: HeadersInit = {};
  const allowAnyOrigin = orgSettings.cors.allowOrigins.includes("*");
  const requestFromValidOrigin =
    allowAnyOrigin ||
    (requestOrigin && orgSettings.cors.allowOrigins.includes(requestOrigin));
  const requestHasCredentials = Boolean(
    request.headers.get("Cookie") || request.headers.get("Authorization")
  );

  if (requestFromValidOrigin) {
    /*
    As per https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    "Only a single origin can be specified. If the server supports clients from multiple origins, it must return the origin for the specific client making the request."
    "For requests without credentials, the literal value "*" can be specified as a wildcard"
    */
    headers["Access-Control-Allow-Origin"] =
      allowAnyOrigin && !requestHasCredentials
        ? "*"
        : (requestOrigin as string);
  }

  if (orgSettings.cors.exposeHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] =
      orgSettings.cors.exposeHeaders.join(", ");
  }

  if (!isUndefined(orgSettings.cors.maxAge)) {
    headers["Access-Control-Max-Age"] = orgSettings.cors.maxAge.toString();
  }

  if (!isUndefined(orgSettings.cors.allowCredentials)) {
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

  return headers;
}
