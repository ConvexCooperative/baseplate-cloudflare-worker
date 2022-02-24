import { handleRequest, updateRouteMatchers } from "./main";
import { MockCloudflareKV } from "./setupTests";
import { ImportMap } from "./handleImportMap";

describe("main handle request", () => {
  it("has correct route handlers for prod FOUNDRY_ENV", async () => {
    global.FOUNDRY_ENV = "prod";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-systemjs": importMap,
    });

    let response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/stage/systemjs.importmap"
      )
    );

    expect(response.status).toBe(404);
  });

  it("has correct route handlers for test FOUNDRY_ENV", async () => {
    global.FOUNDRY_ENV = "test";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-systemjs": importMap,
    });

    let response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/systemjs.importmap"
      )
    );

    expect(response.status).toBe(404);

    response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/stage/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it("has correct route handlers for dev FOUNDRY_ENV", async () => {
    global.FOUNDRY_ENV = "dev";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-systemjs": importMap,
    });

    let response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/stage/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });
});
