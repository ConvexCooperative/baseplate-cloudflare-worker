import "isomorphic-fetch";
import { jest } from "@jest/globals";
import { MockInstance } from "jest-mock";
import { OrgSettings } from "./getOrgSettings";
import { merge } from "lodash-es";

let mocks = {};

global.FOUNDRY_ENV = "prod";
global.FOUNDRY_MFE_HOST = "https://example.com/";

beforeEach(() => {
  global.FOUNDRY_MFE_HOST = "https://cdn.single-spa-foundry.com/apps/";

  mocks = {};

  const mainKv: MockCloudflareKV = {
    get: jest.fn(),
    mockKv(newMocks: KvMocks) {
      merge(mocks, newMocks);
    },
  };

  (mainKv.get as MockInstance).mockImplementation(async (key: string) => {
    for (let k in mocks) {
      if (k === key) {
        return mocks[k];
      }
    }

    if (key.startsWith("org-settings-")) {
      const orgSettings: Partial<OrgSettings> = {
        orgExists: true,
        staticFiles: {
          microfrontendProxy: {
            environments: {
              __main__: "https://example.com/",
            },
          },
        },
      };

      return orgSettings;
    }

    return false;
  });

  global.MAIN_KV = mainKv;
  global.FOUNDRY_ENV = "prod";
  global.FOUNDRY_MFE_HOST = "https://example.com/";
});

export interface MockCloudflareKV {
  get<ReturnValue>(key: string): Promise<ReturnValue>;
  mockKv(mocks: KvMocks): void;
}

interface KvMocks {
  [key: string]: any;
}
