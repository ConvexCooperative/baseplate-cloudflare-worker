import { handleRequest, updateRouteMatchers } from "./main";
import { MockCloudflareKV } from "./setupTests";
import { ImportMap } from "./handleImportMap";
import { jest } from "@jest/globals";

describe("main handle request", () => {
  it("has correct route handlers for prod BASEPLATE_ENV", async () => {
    global.BASEPLATE_ENV = "prod";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });

    let response = await handleRequest(
      createFetchEvent("https://cdn.baseplate.cloud/walmart/systemjs.importmap")
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      createFetchEvent(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      )
    );

    expect(response.status).toBe(404);
  });

  it("has correct route handlers for test BASEPLATE_ENV", async () => {
    global.BASEPLATE_ENV = "test";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });

    let response = await handleRequest(
      createFetchEvent("https://cdn.baseplate.cloud/walmart/systemjs.importmap")
    );

    expect(response.status).toBe(404);

    response = await handleRequest(
      createFetchEvent(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it("has correct route handlers for dev BASEPLATE_ENV", async () => {
    global.BASEPLATE_ENV = "dev";
    updateRouteMatchers();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-walmart-prod-systemjs": importMap,
    });

    let response = await handleRequest(
      createFetchEvent("https://cdn.baseplate.cloud/walmart/systemjs.importmap")
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);

    response = await handleRequest(
      createFetchEvent(
        "https://cdn.baseplate.cloud/walmart/prod/systemjs.importmap"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });
});

function createFetchEvent(url: string): FetchEvent {
  const evt: FetchEvent = new Event("fetch") as FetchEvent;
  evt.waitUntil = jest.fn();
  // @ts-ignore
  evt.request = new Request(url);

  return evt;
}
