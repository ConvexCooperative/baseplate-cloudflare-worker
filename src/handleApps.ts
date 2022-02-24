import {
  getOrgSettings,
  OrgSettings,
  StaticFileProxySettings,
} from "./getOrgSettings";
import { notFoundResponse } from "./responseUtils";

export async function handleApps(
  request: Request,
  params: Params
): Promise<Response> {
  const orgSettings = await getOrgSettings(params.orgKey);

  if (!orgSettings.orgExists) {
    return notFoundResponse(request, orgSettings);
  }

  const requestUrl = new URL(request.url);

  const proxySettings = getMicrofrontendProxySettings(orgSettings);
  const proxyHost = getMicrofrontendProxyHost(proxySettings);
  const proxyUrl = proxyHost + params.pathParts.join("/") + requestUrl.search;

  const proxyRequest = new Request(proxyUrl, request);
  proxyRequest.headers.set("Origin", requestUrl.origin);

  const proxyResponse = await fetch(proxyRequest);

  // TODO: insert cors headers

  return proxyResponse;
}

function getMicrofrontendProxySettings(
  orgSettings: OrgSettings
): StaticFileProxySettings {
  // TODO: deal with FOUNDRY_ENV and also customer envs
  const env = "default";

  return orgSettings.staticFiles.microfrontendProxy.environments[env];
}

function getMicrofrontendProxyHost(
  envSettings: StaticFileProxySettings
): string {
  return envSettings.useFoundryHosting
    ? FOUNDRY_MFE_HOST
    : (envSettings.customHost as string);
}

interface Params {
  orgKey: string;
  pathParts: string[];
}
