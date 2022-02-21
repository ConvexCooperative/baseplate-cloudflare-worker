import { getOrgSettings } from "./getOrgSettings";
import { internalErrorResponse, notFoundResponse } from "./responseUtils";
import { isPlainObject } from "lodash-es";
import { corsHeaders } from "./cors";

const emptyImportMap: ImportMap = {
  imports: {},
  scopes: {},
};

export async function handleImportMap(
  request: Request,
  params: Params
): Promise<Response> {
  const [orgSettings, importMap] = await Promise.all([
    getOrgSettings(params.orgKey),
    readImportMap(params),
  ]);

  if (orgSettings.orgExists && importMap) {
    const importMapErrors = verifyImportMap(importMap);

    if (importMapErrors.length > 0) {
      console.error(
        `Import Map Invalid for org ${params.orgKey} and request URL ${request.url}!`
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
        },
      });
    }
  } else {
    return notFoundResponse(request, orgSettings);
  }
}

async function readImportMap({
  orgKey,
  importMapName,
}: Params): Promise<ImportMap | null> {
  const kvKey = `import-map-${orgKey}-${importMapName}`;

  try {
    return (await MAIN_KV.get(kvKey, {
      type: "json",
    })) as ImportMap | null;
  } catch (err) {
    // Defensive programming so that we don't take down their production applications
    // if KV has invalid JSON in it or is down
    console.error(`Error reading import map with key ${kvKey}`);
    console.error(err);
    return null;
  }
}

function verifyImportMap(input: ImportMap | null): string[] {
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

interface Params {
  orgKey: string;
  importMapName: string;
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
