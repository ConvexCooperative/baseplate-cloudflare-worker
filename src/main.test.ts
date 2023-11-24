import { handleRequest } from "./main";
import { createTestContext, createTestEnv } from "./setupTests";
import { ImportMap } from "./handleImportMap";
import { CustomDomain, CustomDomainPurpose } from "@baseplate-sdk/utils";

describe("main handle request", () => {
  describe("Not Custom Domain", () => {
    runTests(false);
  });

  describe("Custom Domains - CDN Proxy", () => {
    runTests(true);
  });

  describe("Custom Domains - Web App", () => {
    it("returns an HTML file for root path", async () => {
      const request = new Request("https://app.walmart.com");
      const env = createTestEnv();
      const customDomain: CustomDomain = {
        orgKey: "walmart",
        purpose: CustomDomainPurpose.web_app,
        customerEnv: "prod",
        webAppHtmlFilename: "index",
      };

      env.MAIN_KV.mockKv({
        "custom-domain-app.walmart.com": customDomain,
        "import-map-walmart-prod-systemjs": { imports: {}, scopes: {} },
        "html-file-walmart-index": {},
      });

      let response = await handleRequest(request, env, createTestContext());
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toEqual("text/html");
    });

    it("returns an HTML file for arbitrary other path", async () => {
      const request = new Request(
        "https://app.walmart.com/user-settings/sdf908sfsdfi89sdf"
      );
      const env = createTestEnv();
      const customDomain: CustomDomain = {
        orgKey: "walmart",
        purpose: CustomDomainPurpose.web_app,
        customerEnv: "prod",
        webAppHtmlFilename: "index",
      };

      env.MAIN_KV.mockKv({
        "custom-domain-app.walmart.com": customDomain,
        "import-map-walmart-prod-systemjs": { imports: {}, scopes: {} },
        "html-file-walmart-index": {},
      });

      let response = await handleRequest(request, env, createTestContext());
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toEqual("text/html");
    });
  });
});

function customDomainsUrl(pathname: string, isCustomDomains: boolean): string {
  const url =
    (isCustomDomains
      ? "https://cdn.walmart.com"
      : "https://cdn.baseplate.cloud/walmart") + pathname;
  return url;
}

function runTests(isCustomDomains: boolean) {
  function mockCustomDomainsLookup(env) {
    const value: CustomDomain = {
      orgKey: "walmart",
      purpose: CustomDomainPurpose.cdn_proxy,
    };

    env.MAIN_KV.mockKv({
      "custom-domain-cdn.walmart.com": value,
    });
  }

  it("has correct route handlers", async () => {
    const env = createTestEnv();
    env.BASEPLATE_ENV = "prod";
    const context = createTestContext();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });
    mockCustomDomainsLookup(env);

    let response = await handleRequest(
      new Request(
        customDomainsUrl(`/prod/systemjs.importmap`, isCustomDomains),
        {}
      ),
      env,
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });
}
