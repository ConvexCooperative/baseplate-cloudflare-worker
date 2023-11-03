import { handleRequest } from "./main";
import { createTestContext, createTestEnv } from "./setupTests";
import { ImportMap } from "./handleImportMap";

describe("main handle request", () => {
  describe("Not Custom Domain", () => {
    runTests(false);
  });

  fdescribe("Custom Domains", () => {
    runTests(true);
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
    env.MAIN_KV.mockKv({
      "custom-domain-cdn.walmart.com": "walmart",
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
