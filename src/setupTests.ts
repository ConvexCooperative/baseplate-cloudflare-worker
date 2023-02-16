import "isomorphic-fetch";
import { jest } from "@jest/globals";
import { MockInstance } from "jest-mock";
import { OrgSettings } from "@baseplate-sdk/utils";
import { merge } from "lodash-es";

let mocks = {};

global.BASEPLATE_ENV = "prod";
global.AWS_ACCESS_KEY_ID = "sdflsadfa";
global.AWS_SECRET_ACCESS_KEY = "fasouwqeor";
global.TIMESTREAM_DATABASE = "test";
global.TIMESTREAM_TABLE = "test";

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
          cacheControl: "public, max-age=50000",
          microfrontendProxy: {
            environments: {
              prod: {
                useBaseplateHosting: false,
                host: "https://cdn.baseplate.cloud/",
              },
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
