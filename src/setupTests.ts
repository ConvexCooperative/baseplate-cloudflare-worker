import "isomorphic-fetch";
import { jest } from "@jest/globals";
import { OrgSettings } from "./getOrgSettings";

beforeEach(() => {
  const mainKv: MockCloudflareKV = {
    get: jest.fn(),
    mockKv(mocks: KvMocks) {
      const kv: jest.Mock<any> = global.MAIN_KV.get as jest.Mock<any>;
      kv.mockImplementation(async (key: string) => {
        for (let k in mocks) {
          if (k === key) {
            return mocks[k];
          }
        }

        if (key.startsWith("org-settings-")) {
          const orgSettings: Partial<OrgSettings> = {
            orgExists: true,
          };

          return orgSettings;
        }

        return false;
      });
    },
  };

  global.MAIN_KV = mainKv;
});

export interface MockCloudflareKV {
  get<ReturnValue>(key: string): Promise<ReturnValue>;
  mockKv(mocks: KvMocks): void;
}

interface KvMocks {
  [key: string]: any;
}
