import { handleRequest } from "./main";
import { createTestContext, createTestEnv } from "./setupTests";
import { ImportMap } from "./handleImportMap";

describe("main handle request", () => {
  it("has correct route handlers for prod BASEPLATE_ENV", async () => {
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

    let response = await handleRequest(
      new Request("https://cdn.baseplate.cloud/walmart/systemjs.importmap"),
      env,
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      new Request(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      ),
      env,
      context
    );

    expect(response.status).toBe(404);
  });

  it("has correct route handlers for test BASEPLATE_ENV", async () => {
    const env = createTestEnv();
    env.BASEPLATE_ENV = "test";
    const context = createTestContext();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });

    let response = await handleRequest(
      new Request("https://cdn.baseplate.cloud/walmart/systemjs.importmap"),
      env,
      context
    );

    expect(response.status).toBe(404);

    response = await handleRequest(
      new Request(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      ),
      env,
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it("has correct route handlers for dev BASEPLATE_ENV", async () => {
    const env = createTestEnv();
    const context = createTestContext();
    env.BASEPLATE_ENV = "dev";

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });

    let response = await handleRequest(
      new Request("https://cdn.baseplate.cloud/walmart/systemjs.importmap"),
      env,
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      new Request(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      ),
      env,
      context
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });
});
