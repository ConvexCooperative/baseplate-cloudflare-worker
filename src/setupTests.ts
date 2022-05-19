import "isomorphic-fetch";
import { jest } from "@jest/globals";
import { MockInstance } from "jest-mock";
import { OrgSettings } from "./getOrgSettings";
import { merge } from "lodash-es";

let mocks = {};

global.BASEPLATE_ENV = "prod";

beforeEach(() => {
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
              prod: "https://example.com/",
            },
          },
        },
      };

      return orgSettings;
    }

    return false;
  });

  global.MAIN_KV = mainKv;
  global.BASEPLATE_ENV = "prod";
});

export interface MockCloudflareKV {
  get<ReturnValue>(key: string): Promise<ReturnValue>;
  mockKv(mocks: KvMocks): void;
}

interface KvMocks {
  [key: string]: any;
}
