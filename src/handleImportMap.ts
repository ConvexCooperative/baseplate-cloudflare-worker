import { getOrgSettings } from "./getOrgSettings";
import { internalErrorResponse, notFoundResponse } from "./responseUtils";
import { isPlainObject } from "lodash-es";
import { corsHeaders } from "./cors";
import { baseplateVersion } from "./baseplateVersion";
import { RequestLog } from "./logRequests";
import { EnvVars } from "./main";

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
    const importMapErrors = verifyImportMap(importMap);

    if (importMapErrors.length > 0) {
      console.error(
        `Import Map Invalid for org ${orgKey} and request URL ${request.url}!`
      );
      console.error(importMapErrors);
      return internalErrorResponse(request, orgSettings);
    } else {
      addPackagesViaTrailingSlashes(importMap);

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

export async function readImportMap(
  { importMapName, customerEnv }: Params,
  env: EnvVars,
  orgKey: string
): Promise<ImportMap | null> {
  const kvKey = `import-map-${orgKey}-${customerEnv}-${importMapName}`;

  try {
    return (await env.MAIN_KV.get(kvKey, {
      type: "json",
    })) as ImportMap | null;
  } catch (err) {
    // Defensive programming so that we don't take down their production applications
    // if KV has invalid JSON in it or is down
    console.error(`Error reading import map with key ${kvKey}`);
    console.error(err);
    console.error(err ? err.message : err);
    return null;
  }
}

export function verifyImportMap(input: ImportMap | null): string[] {
  const errors: string[] = [];

  if (isPlainObject(input)) {
    const importMap = input as ImportMap;

    if (isPlainObject(importMap.imports)) {
      errors.push(...verifyModuleMap(importMap.imports, "importMap.imports"));
    } else {
      errors.push("importMap.imports is not present");
    }

    if (isPlainObject(importMap.scopes)) {
      for (let scope in importMap.scopes) {
        const moduleMap = importMap.scopes[scope];
        if (isPlainObject(moduleMap)) {
          errors.push(
            ...verifyModuleMap(moduleMap, `importMap.scopes[${scope}]`)
          );
        } else {
          errors.push(
            `importMap.scopes[${scope}] is not a plain object: ${moduleMap}`
          );
        }
      }
    } else {
      errors.push("importMap.scopes is not present");
    }
  } else {
    errors.push(`importMap is falsey value or not object: ${input}`);
  }

  return errors;
}

function verifyModuleMap(moduleMap: ModuleMap, path: string): string[] {
  const errors: string[] = [];

  for (let key in moduleMap) {
    if (typeof moduleMap[key] !== "string") {
      errors.push(`${path}[${key}] is not a string: ${moduleMap[key]}`);
    }
  }

  return errors;
}

function addPackagesViaTrailingSlashes(importMap: ImportMap) {
  for (let importSpecifier in importMap.imports) {
    if (!importSpecifier.endsWith("/")) {
      importMap.imports[importSpecifier + "/"] = new URL(
        ".",
        importMap.imports[importSpecifier]
      ).href;
    }
  }
}

interface Params {
  importMapName: string;
  customerEnv: string;
}

export interface ImportMap {
  imports: ModuleMap;
  scopes: {
    [scope: string]: ModuleMap;
  };
}

interface ModuleMap {
  [moduleName: string]: string;
}
