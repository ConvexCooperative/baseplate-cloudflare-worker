import { getOrgSettings } from "./getOrgSettings";
import { internalErrorResponse, notFoundResponse } from "./responseUtils";
import { corsHeaders } from "./cors";
import { baseplateVersion } from "./baseplateVersion";
import { RequestLog } from "./logRequests";
import { EnvVars } from "./main";
import {
  readImportMap,
  importMapHostname,
  processImportMap,
} from "./importMapUtils";
import { CustomDomain } from "@baseplate-sdk/utils";

export async function handleImportMap(
  request: Request,
  params: Params,
  requestLog: RequestLog,
  env: EnvVars,
  orgKey?: string
): Promise<Response> {
  requestLog.isImportMap = true;

  if (!orgKey) {
    console.error(
      `No orgKey passed to handleImportMap function. Returning HTTP 500.`
    );
    return internalErrorResponse(request);
  }

  const [orgSettings, importMap] = await Promise.all([
    getOrgSettings(orgKey, env),
    readImportMap(params, env, orgKey),
  ]);

  if (orgSettings.orgExists && importMap) {
    const importMapErrors = processImportMap(
      importMap,
      importMapHostname(params.customDomain, orgSettings)
    );

    if (importMapErrors.length > 0) {
      console.error(
        `Import Map Invalid for org ${orgKey} and request URL ${request.url}!`
      );
      console.error(importMapErrors);
      return internalErrorResponse(request, orgSettings);
    } else {
      return new Response(JSON.stringify(importMap, null, 2), {
        status: 200,
        headers: {
          // https://github.com/WICG/import-maps#installation
          "content-type": "application/importmap+json; charset=UTF-8",
          "cache-control": orgSettings.importMapCacheControl,
          ...corsHeaders(request, orgSettings),
          ...baseplateVersion(),
        },
      });
    }
  } else {
    return notFoundResponse(request, orgSettings);
  }
}

interface Params {
  importMapName: string;
  customerEnv: string;
  customDomain: CustomDomain | null;
}
