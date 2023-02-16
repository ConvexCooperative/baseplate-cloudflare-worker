import "isomorphic-fetch";
import { jest } from "@jest/globals";
import { MockInstance } from "jest-mock";
import { OrgSettings } from "@baseplate-sdk/utils";
import { merge } from "lodash-es";
import { EnvVars } from "./main";

let mocks = {};

export function createTestEnv(): EnvVars {
  return {
    AWS_ACCESS_KEY_ID: "1",
    AWS_REGION: "us-east-1",
    AWS_SECRET_ACCESS_KEY: "2",
    BASEPLATE_ENV: "dev",
    MAIN_KV: createMainKv(),
    TIMESTREAM_DATABASE: "db",
    TIMESTREAM_TABLE: "table",
  };
}

export function createTestContext(): ExecutionContext {
  return {
    waitUntil(promise: Promise) {},
    passThroughOnExecption() {},
  };
}

function createMainKv(): MockCloudflareKV {
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

  return mainKv;
}

beforeEach(() => {
  mocks = {};
});

export interface MockCloudflareKV {
  get<ReturnValue>(key: string): Promise<ReturnValue>;
  mockKv(mocks: KvMocks): void;
}

interface KvMocks {
  [key: string]: any;
}
