import { corsHeaders } from "./cors";
import { baseplateVersion } from "./baseplateVersion";
import { OrgSettings, StaticFileProxySettings } from "@baseplate-sdk/utils";
import { getOrgSettings } from "./getOrgSettings";
import { notFoundResponse, internalErrorResponse } from "./responseUtils";

export async function handleApps(
  request: Request,
  params: Params
): Promise<Response> {
  const orgSettings = await getOrgSettings(params.orgKey);

  if (!orgSettings.orgExists) {
    return notFoundResponse(request, orgSettings);
  }

  const requestUrl = new URL(request.url);

  const proxySettings = getMicrofrontendProxySettings(
    orgSettings,
    params.customerEnv
  );
  if (!proxySettings) {
    console.error(
      `No proxy settings found for org ${params.orgKey} and customerEnv ${params.customerEnv}`
    );
    return internalErrorResponse(request, orgSettings);
  }

  const proxyHost = getMicrofrontendProxyHost(proxySettings);

  if (!proxyHost) {
    console.error(
      `No proxy host found for org ${params.orgKey} and customerEnv ${params.customerEnv}`
    );
  }

  const proxyUrl = proxyHost + params.pathParts.join("/") + requestUrl.search;

  const proxyRequest = new Request(proxyUrl, request);
  proxyRequest.headers.set("Origin", requestUrl.origin);

  const proxyResponse = await fetch(proxyRequest);

  const finalResponse = new Response(proxyResponse.body, proxyResponse);
  const additionalHeaders = {
    "cache-control": orgSettings.staticFiles.cacheControl,
    ...corsHeaders(request, orgSettings),
    ...baseplateVersion(),
  };
  for (let additionalHeader in additionalHeaders) {
    finalResponse.headers.set(
      additionalHeader,
      additionalHeaders[additionalHeader]
    );
  }

  return finalResponse;
}

function getMicrofrontendProxySettings(
  orgSettings: OrgSettings,
  customerEnv: string
): StaticFileProxySettings {
  return orgSettings.staticFiles.microfrontendProxy.environments[customerEnv];
}

function getMicrofrontendProxyHost(
  envSettings: StaticFileProxySettings
): string {
  return envSettings.customHost;
}

interface Params {
  orgKey: string;
  pathParts: string[];
  customerEnv: string;
}
