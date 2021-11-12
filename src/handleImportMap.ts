import { getOrgSettings } from "./getOrgSettings";
import { notFoundResponse } from "./notFound";

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

  if (orgSettings.orgExists) {
    return new Response(JSON.stringify(importMap, null, 2), {
      status: 200,
      headers: {
        // https://github.com/WICG/import-maps#installation
        "content-type": "application/importmap+json; charset=UTF-8",
        "cache-control": orgSettings.importMapCacheControl,
      },
    });
  } else {
    return notFoundResponse();
  }
}

async function readImportMap({
  orgKey,
  importMapName,
}: Params): Promise<ImportMap> {
  let importMapKV: ImportMap | null = null;
  try {
    importMapKV = (await MAIN_KV.get(`import-map-${orgKey}-${importMapName}`, {
      type: "json",
    })) as ImportMap | null;
  } catch (err) {
    // Defensive programming so that we don't take down their production applications
    // if KV has invalid JSON in it or is down
    console.error(err);
  }

  let importMap: ImportMap;

  if (importMapKV) {
    importMap = importMapKV;
  } else {
    console.warn(`No import map found for orgKey '${orgKey}'`);
    importMap = emptyImportMap;
  }

  // In case the KV value is somehow corrupted, still return a valid import map
  if (!importMap.imports) {
    importMap.imports = {};
  }

  // In case the KV value is somehow corrupted, still return a valid import map
  if (!importMap.scopes) {
    importMap.scopes = {};
  }

  return importMap;
}

interface Params {
  orgKey: string;
  importMapName: string;
}

interface ImportMap {
  imports: ModuleMap;
  scopes: {
    [scope: string]: ModuleMap;
  };
}

interface ModuleMap {
  [moduleName: string]: string;
}
