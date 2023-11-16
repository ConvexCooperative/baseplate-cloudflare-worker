import { handleImportMap, ImportMap } from "./handleImportMap";
import { EnvVars } from "./main";
import { createTestEnv } from "./setupTests";
import { sampleLog } from "./testUtils";

describe(`handleImportMap`, () => {
  let env: EnvVars, orgKey: string | undefined;

  beforeEach(() => {
    env = createTestEnv();
    orgKey = "juc";
  });

  it(`returns a valid import map`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "https://cdn.baseplate.cloud/react.js",
        "react/": "https://cdn.baseplate.cloud/",
      },
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": importMap,
    });
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it(`returns a valid import map, with packages via trailing slashes`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "https://cdn.baseplate.cloud/react.js",
      },
      scopes: {},
    };

    const importMapPackagesViaTrailingSlashes: ImportMap = {
      imports: {
        react: "https://cdn.baseplate.cloud/react.js",
        "react/": "https://cdn.baseplate.cloud/",
      },
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": importMap,
    });
    const request = new Request("https://cdn.example.com/systemjs.importmap");
    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMapPackagesViaTrailingSlashes);
  });

  it(`returns a 404 Not Found if the map isn't in KV`, async () => {
    env.MAIN_KV.mockKv({});

    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(404);
  });

  it(`returns a 500 if importMap.imports is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": {
        // strings are invalid values for "imports"
        imports: "asdfsadf",
      },
    });

    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.imports[key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": {
        imports: {
          // object is invalid here
          react: {},
        },
      },
    });

    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.scopes[key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": {
        imports: {
          react: "https://cdn.baseplate.cloud/react.js",
        },
        // strings are invalid values for "scopes"
        scopes: "asdfsafd",
      },
    });

    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(500);
  });

  it(`returns a 500 if importMap.scopes[key][key] is invalid`, async () => {
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": {
        imports: {
          react: "https://cdn.baseplate.cloud/react.js",
        },
        scopes: {
          "/hi/": {
            react: {},
          },
        },
      },
    });

    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(500);
  });

  it(`returns valid cors headers for cross origin response`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "https://cdn.baseplate.cloud/react.js",
      },
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": importMap,
    });
    const request = new Request(
      "https://cdn.example.com/walmart/systemjs.importmap"
    );
    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it(`appends baseplate-version header to import maps`, async () => {
    const importMap: ImportMap = {
      imports: {
        react: "https://cdn.baseplate.cloud/react.js",
      },
      scopes: {},
    };

    env.MAIN_KV.mockKv({
      "import-map-juc-prod-system": importMap,
    });

    const request = new Request(
      "https://cdn.example.com/juc/prod/systemjs.importmap"
    );
    const response: Response = await handleImportMap(
      request,
      {
        importMapName: "system",
        customerEnv: "prod",
      },
      sampleLog(),
      env,
      orgKey
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("baseplate-version")).toBeTruthy();
  });
});
