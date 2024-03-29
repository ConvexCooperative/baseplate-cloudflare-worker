import { getOrgSettings } from "./getOrgSettings";
import { RequestLog } from "./logRequests";
import { EnvVars } from "./main";
import { internalErrorResponse, notFoundResponse } from "./responseUtils";
import indexHtmlTemplate from "./indexHtml.mustache";
import { corsHeaders } from "./cors";
import { baseplateVersion } from "./baseplateVersion";
import Mustache from "mustache";
import {
  CustomDomain,
  HTMLTemplateParams,
  mergeDefaultHtmlParams,
} from "@baseplate-sdk/utils";
import {
  readImportMap,
  processImportMap,
  importMapHostname,
} from "./importMapUtils";
import * as singleSpa from "single-spa";
import { constructApplications, constructRoutes } from "single-spa-layout";
import { isCustomDomain } from "./customDomains";
import { parseFragment } from "parse5";

// Renders an HTML file to be used as a single-spa root config
export async function handleIndexHtml(
  request: Request,
  params: HandleIndexHtmlParams,
  requestLog: RequestLog,
  env: EnvVars,
  orgKey?: string,
): Promise<Response> {
  if (!orgKey) {
    console.error(
      `No orgKey passed to handleIndexHtml function. Returning HTTP 500.`,
    );
    return internalErrorResponse(request);
  }

  const [orgSettings, templateParameters] = await Promise.all([
    getOrgSettings(orgKey, env),
    env.MAIN_KV.get(
      `html-file-${orgKey}-${params.customerEnv}-${params.htmlFileName}`,
      {
        type: "json",
      },
    ),
  ]);

  if (!orgSettings.orgExists || !templateParameters) {
    return notFoundResponse(request, orgSettings);
  }

  const finalParams: FinalHTMLTemplateParams =
    mergeDefaultHtmlParams(templateParameters);

  const importMap = await readImportMap(
    {
      importMapName: finalParams.importMap.name,
      customerEnv: params.customerEnv,
    },
    env,
    orgKey,
  );
  const importMapErrors = processImportMap(
    importMap,
    importMapHostname(params.customDomain, orgSettings),
    orgKey,
  );

  if (importMapErrors.length > 0) {
    console.error(
      `Import Map Invalid for org ${orgKey} and request URL ${request.url}!`,
    );
    console.error(importMapErrors);
    return internalErrorResponse(request, orgSettings);
  }

  // Add derived properties used in MustacheJS template
  finalParams.importMap.isSystemJS = finalParams.importMap.type === "systemjs";

  switch (finalParams.pageInit.type) {
    case "module":
      finalParams.pageInit.isSingleSpa = false;
      finalParams.pageInit.isEntryModule = true;
      break;
    case "single-spa":
      importMap!.imports["single-spa"] = finalParams.importMap.isSystemJS
        ? "https://cdn.jsdelivr.net/npm/single-spa@6.0.0/lib/es2015/system/single-spa.dev.min.js"
        : "https://cdn.jsdelivr.net/npm/single-spa@6.0.0/lib/es2015/esm/single-spa.min.js";

      importMap!.imports["single-spa-layout"] = finalParams.importMap.isSystemJS
        ? "https://cdn.jsdelivr.net/npm/single-spa-layout@2.2.0/dist/system/single-spa-layout.min.js"
        : "https://cdn.jsdelivr.net/npm/single-spa-layout@2.2.0/dist/esm/single-spa-layout.min.js";

      importMap!.imports["react"] = finalParams.importMap.isSystemJS
        ? "https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"
        : "https://cdn.jsdelivr.net/npm/react@18.2.0/+esm";

      importMap!.imports["react-dom"] = finalParams.importMap.isSystemJS
        ? "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"
        : "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm";

      finalParams.pageInit.isSingleSpa = true;
      finalParams.pageInit.isEntryModule = false;

      const parsedLayout = parseFragment(finalParams.pageInit.layoutTemplate);
      const routes = constructRoutes(
        parsedLayout.childNodes[0] as unknown as Element,
      );
      const applications = constructApplications({
        routes,
        async loadApp({ name }) {
          return { async bootstrap() {}, async mount() {}, async unmount() {} };
        },
      });
      const registerApplication =
        singleSpa["registerApplication"] ??
        // @ts-ignore
        singleSpa.default["registerApplication"];
      const checkActivityFunctions =
        singleSpa["checkActivityFunctions"] ??
        // @ts-ignore
        singleSpa.default["checkActivityFunctions"];
      const unregisterApplication =
        singleSpa["unregisterApplication"] ??
        // @ts-ignore
        singleSpa.default["unregisterApplication"];

      applications.forEach(registerApplication);
      let activeApplicationNames: string[], singleSpaLocation: URL;
      const requestUrl = new URL(request.url);
      if (isCustomDomain(requestUrl.hostname)) {
        singleSpaLocation = requestUrl;
      } else {
        const path = new URLSearchParams(requestUrl.search).get("path") ?? "/";
        singleSpaLocation = new URL(path, "https://example.com");
      }
      activeApplicationNames = checkActivityFunctions(
        // URL and Location objects are similar enough for single-spa to work with either
        singleSpaLocation as unknown as Location,
      );
      applications.forEach((application) => {
        unregisterApplication(application.name);
      });

      for (let activeAppName of activeApplicationNames) {
        finalParams.preloads.push({
          as:
            finalParams.importMap.type === "native"
              ? "modulepreload"
              : "script",
          importSpecifier: activeAppName,
        });
      }
      break;
    default:
      console.error(
        // @ts-ignore
        `handleIndexHtml: htmlTemplateParameters.pageInit.type '${finalParams.pageInit.type}' is not supported.`,
      );
      return internalErrorResponse(request, orgSettings);
  }

  finalParams.importMap.json = JSON.stringify(importMap!, null, 2);
  finalParams.importMap.url = new URL(
    `./${finalParams.importMap.name}.importmap`,
    request.url,
  ).href;

  // Preload JS files from the import map that are known to be needed
  // Since browsers don't support import map specifiers in preload <link> elements,
  // we tell the browser to preload the full URL for the module, as found in the
  // import map
  for (let [index, preload] of finalParams.preloads.entries()) {
    if (preload.importSpecifier) {
      if (importMap?.imports[preload.importSpecifier]) {
        preload.href = importMap.imports[preload.importSpecifier];
        preload.as =
          finalParams.importMap.type === "native" ? "modulepreload" : "script";
      } else {
        console.error(
          `import specifier '${preload.importSpecifier}' cannot be preloaded because it doesn't exist in the import map`,
        );
        // Skip this preload, but still return the html file
        finalParams.preloads.splice(index, 1);
      }
    }
  }

  const html = Mustache.render(indexHtmlTemplate, finalParams);

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html",
      // TODO: make this configurable as part of org settings
      "cache-control": "public, max-age=3600",
      // TODO: make this configurable as part of org settings or html params
      "content-security-policy":
        "default-src 'self' https: localhost:*; script-src 'unsafe-inline' 'unsafe-eval' https: localhost:*; connect-src https: localhost:* ws://localhost:*; style-src 'unsafe-inline' https:; object-src 'none';",
      ...corsHeaders(request, orgSettings),
      ...baseplateVersion(),
    },
  });
}

export interface HandleIndexHtmlParams {
  customerEnv: string;
  htmlFileName: string;
  customDomain: CustomDomain | null;
}

type FinalHTMLTemplateParams = HTMLTemplateParams & {
  importMap: HTMLTemplateParams["importMap"] & {
    isSystemJS?: boolean;
    json?: string;
    url?: string;
  };
  pageInit: HTMLTemplateParams["pageInit"] & {
    isSingleSpa: boolean;
    isEntryModule: boolean;
  };
};
