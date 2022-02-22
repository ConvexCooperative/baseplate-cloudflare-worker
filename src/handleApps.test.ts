import { jest } from "@jest/globals";
import { OrgSettings } from "./getOrgSettings";
import { handleApps } from "./handleApps";
import { MockCloudflareKV } from "./setupTests";

describe(`handleApps`, () => {
  let response,
    mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch = jest.fn();
    // @ts-ignore
    global.fetch = mockFetch;

    response = null;
  });

  it(`determines correct proxy url when using foundry hosting`, async () => {
    mockFetch.mockReturnValueOnce(
      new Response("console.log('hi');", {
        status: 200,
      })
    );

    response = await handleApps(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/apps/navbar/c1a777c770ee187cebedd0724653c771495f2af9/react-mf-navbar.js"
      ),
      {
        orgKey: "walmart",
        pathParts: [
          "apps",
          "navbar",
          "c1a777c770ee187cebedd0724653c771495f2af9",
          "react-mf-navbar.js",
        ],
      }
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect((mockFetch.mock.calls[0][0] as Request).url).toBe(
      global.FOUNDRY_MFE_HOST +
        "navbar/c1a777c770ee187cebedd0724653c771495f2af9/react-mf-navbar.js"
    );
  });

  it(`determines correct proxy url when not using custom hosting`, async () => {
    const orgSettings: RecursivePartial<OrgSettings> = {
      orgExists: true,
      staticFiles: {
        microfrontendProxy: {
          environments: {
            default: {
              useFoundryHosting: false,
              customHost: "https://cdn.walmart.com/",
            },
          },
        },
      },
    };

    (global.MAIN_KV as MockCloudflareKV).mockKv({
      "org-settings-walmart": orgSettings,
    });
    mockFetch.mockReturnValueOnce(
      new Response("console.log('hi');", {
        status: 200,
      })
    );

    response = await handleApps(
      new Request(
        "https://cdn.single-spa-foundry.com/walmart/apps/navbar/c1a777c770ee187cebedd0724653c771495f2af9/react-mf-navbar.js"
      ),
      {
        orgKey: "walmart",
        pathParts: [
          "apps",
          "navbar",
          "c1a777c770ee187cebedd0724653c771495f2af9",
          "react-mf-navbar.js",
        ],
      }
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect((mockFetch.mock.calls[0][0] as Request).url).toBe(
      "https://cdn.walmart.com/navbar/c1a777c770ee187cebedd0724653c771495f2af9/react-mf-navbar.js"
    );
  });
});

// https://stackoverflow.com/questions/41980195/recursive-partialt-in-typescript
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
