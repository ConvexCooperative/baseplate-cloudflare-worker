import { CustomDomain, OrgSettings } from "@baseplate-sdk/utils";
import { EnvVars } from "./main";
import { isPlainObject } from "lodash-es";
import { isCustomDomain } from "./responseUtils";

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

export function processImportMap(
  input: ImportMap | null,
  hostnameRewrite: string | null
): string[] {
  const errors: string[] = [];

  if (isPlainObject(input)) {
    const importMap = input as ImportMap;

    if (isPlainObject(importMap.imports)) {
      errors.push(
        ...processModuleMap(
          importMap.imports,
          "importMap.imports",
          hostnameRewrite
        )
      );
    } else {
      errors.push("importMap.imports is not present");
    }

    if (isPlainObject(importMap.scopes)) {
      for (let scope in importMap.scopes) {
        const moduleMap = importMap.scopes[scope];
        if (isPlainObject(moduleMap)) {
          errors.push(
            ...processModuleMap(
              moduleMap,
              `importMap.scopes[${scope}]`,
              hostnameRewrite
            )
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

    if (errors.length === 0) {
      addPackagesViaTrailingSlashes(importMap);
    }
  } else {
    errors.push(`importMap is falsey value or not object: ${input}`);
  }

  return errors;
}

function processModuleMap(
  moduleMap: ModuleMap,
  path: string,
  hostnameRewrite: string | null
): string[] {
  const errors: string[] = [];

  for (let key in moduleMap) {
    if (typeof moduleMap[key] !== "string") {
      errors.push(`${path}[${key}] is not a string: ${moduleMap[key]}`);
    }

    if (hostnameRewrite) {
      const url = new URL(moduleMap[key], "https://cdn.baseplate.cloud");
      url.hostname = hostnameRewrite;
      moduleMap[key] = url.href;
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

export function importMapHostname(
  customDomain: CustomDomain | null,
  orgSettings: OrgSettings
): string | null {
  if (customDomain) {
    if (customDomain.isProd) {
      return orgSettings.customDomain.customCDNProdDomain || null;
    } else {
      return orgSettings.customDomain.customCDNTestDomain || null;
    }
  }

  return null;
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
