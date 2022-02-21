import { handleImportMap, ImportMap } from "./handleImportMap";
import { MockCloudflareKV } from "./setupTests";

describe(`handleImportMap`, () => {
  it(`returns a valid import map`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "/react.js",
      },
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": importMap,
    });
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it(`returns a 404 Not Found if the map isn't in KV`, async () => {
    (global.MAIN_KV as MockCloudflareKV).mockKv({});

    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(404);
  });

  it(`returns a 500 if importMap.imports is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": {
        // strings are invalid values for "imports"
        imports: "asdfsadf",
      },
    });

    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.imports[key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": {
        imports: {
          // object is invalid here
          react: {},
        },
      },
    });

    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.scopes[key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": {
        imports: {
          react: "/react.js",
        },
        // strings are invalid values for "scopes"
        scopes: "asdfsafd",
      },
    });

    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.scopes[key][key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": {
        imports: {
          react: "/react.js",
        },
        scopes: {
          "/hi/": {
            react: {},
          },
        },
      },
    });

    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(500);
  });

  it(`returns valid cors headers for cross origin response`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "https://cdn.single-spa-foundry.com/react.js",
      },
      scopes: {},
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "import-map-juc-system": importMap,
    });
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });
});
