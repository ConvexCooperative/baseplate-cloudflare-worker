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
    const request = new Request("https://cdn.example.com");
    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(importMap);
  });

  it(`returns a 404 Not Found if the map isn't in KV`, async () => {
    const request = new Request("https://cdn.example.com");
    const response: Response = await handleImportMap(request, {
      importMapName: "system",
      orgKey: "juc",
    });
    expect(response.status).toBe(404);
  });
});
