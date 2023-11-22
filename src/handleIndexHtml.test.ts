import { HTMLTemplateParams } from "@baseplate-sdk/utils";
import { handleIndexHtml, HandleIndexHtmlParams } from "./handleIndexHtml";
import { EnvVars } from "./main";
import { createTestEnv } from "./setupTests";
import { sampleLog } from "./testUtils";
import { RecursivePartial } from "@baseplate-sdk/utils/lib/utils";
import { getAppNames, unregisterApplication } from "single-spa";
import { load as cheerioLoad } from "cheerio";

describe(`handleIndexHtml`, () => {
  let env: EnvVars,
    orgKey: string | undefined,
    params: HandleIndexHtmlParams,
    layoutTemplate;

  beforeEach(() => {
    env = createTestEnv();
    orgKey = "convex";
    params = {
      customerEnv: "prod",
      htmlFileName: "main",
    };
    layoutTemplate = `
    <single-spa-router>
      <route path="/settings">
        <application name="@walmart/settings"></application>
      </route>
    </single-spa-router>`.trim();

    getAppNames().forEach((appName) => {
      unregisterApplication(appName);
    });
  });

  it(`fails when no orgKey is passed`, async () => {
    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    orgKey = undefined;
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(500);
  });

  it(`returns 404 when organization doesn't exist`, async () => {
    env.MAIN_KV.mockKv({
      [`org-settings-${orgKey}`]: null,
      [`html-file-${orgKey}-${params.htmlFileName}`]: {},
    });
    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(404);
  });

  it(`returns 404 when html file doesn't exist`, async () => {
    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: null,
    });
    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(404);
  });

  it(`returns 500 if import map is missing in KV storage`, async () => {
    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: {
        importMap: { name: "test" },
      },
      [`import-map-${orgKey}-test`]: null,
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(500);
  });

  it(`returns 500 if import map in KV Storage is not really an import map`, async () => {
    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: {
        importMap: { name: "test" },
      },
      [`import-map-${orgKey}-test`]: { invalidKey: {} },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(500);
  });

  it(`default index.html matches snapshot`, async () => {
    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: {
        importMap: { name: "test" },
      },
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {},
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(response.headers.get("content-security-policy")).toMatchSnapshot();
    expect(await response.text()).toMatchSnapshot();
  });

  it(`can render a SystemJS + single-spa root config`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test" },
      pageInit: {
        type: "single-spa",
        layoutTemplate,
      },
    };

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {},
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it(`can render a native module + single-spa root config`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test", type: "systemjs" },
      pageInit: {
        type: "single-spa",
      },
    };

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {},
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it(`can render a systemjs module + entryModule root config`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test", type: "systemjs" },
      pageInit: {
        type: "module",
        entryModule: "@walmart/root-config",
      },
    };

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {},
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it(`can render a native module + entryModule root config`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test", type: "native" },
      pageInit: {
        type: "module",
        entryModule: "@walmart/root-config",
      },
    };

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {},
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toMatchSnapshot();
  });

  it(`renders preloads based on active route`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test", type: "native" },
      pageInit: {
        type: "single-spa",
        layoutTemplate: layoutTemplate,
      },
    };

    const settingsMFEUrl =
      "https://cdn.baseplate.cloud/walmart/prod/apps/settings/v1/settings.js";

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {
          "@walmart/settings": settingsMFEUrl,
        },
        scopes: {},
      },
    });

    const request = new Request(
      `https://cdn.baseplate.cloud/${orgKey}/prod/index.html?path=/settings`
    );
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    const html = await response.text();

    const $ = cheerioLoad(html);
    const linkPreloadEl = $(`link[rel=preload][href="${settingsMFEUrl}"]`);
    expect(linkPreloadEl).toBeTruthy();
  });

  it(`renders preloads based on active route on custom domain`, async () => {
    const templateParameters: RecursivePartial<HTMLTemplateParams> = {
      importMap: { name: "test", type: "native" },
      pageInit: {
        type: "single-spa",
        layoutTemplate: layoutTemplate,
      },
    };

    const settingsMFEUrl =
      "https://cdn.walmart.com/apps/settings/v1/settings.js";

    env.MAIN_KV.mockKv({
      [`html-file-${orgKey}-${params.htmlFileName}`]: templateParameters,
      [`import-map-${orgKey}-${params.customerEnv}-test`]: {
        imports: {
          "@walmart/settings": settingsMFEUrl,
        },
        scopes: {},
      },
    });

    const request = new Request(`https://walmart.com/settings`);
    const response = await handleIndexHtml(
      request,
      params,
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    const html = await response.text();

    const $ = cheerioLoad(html);
    const linkPreloadEl = $(`link[rel=preload][href="${settingsMFEUrl}"]`);
    expect(linkPreloadEl).toBeTruthy();
  });
});
