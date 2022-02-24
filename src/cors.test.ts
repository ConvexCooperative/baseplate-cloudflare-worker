import { handleOptions } from "./cors";
import { CORSSettings, getOrgSettings, OrgSettings } from "./getOrgSettings";
import { MockCloudflareKV } from "./setupTests";

describe("CORS", () => {
  describe("cross origin requests", () => {
    it("responds with default headers when request does not have an orgKey", async () => {
      const request = new Request("https://cdn.example.com/", {
        method: "OPTIONS",
        headers: {
          Origin: "walmart.com",
        },
      });
      const response: Response = await handleOptions(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(null);
    });

    it(`defaults to allowing any origin for orgs`, async () => {
      const request = new Request(
        "https://cdn.example.com/walmart/systemjs.importmap",
        {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        }
      );
      const response: Response = await handleOptions(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    it(`optionally adds access-control-expose-headers header`, async () => {
      let response: Response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Expose-Headers")).toBe(null);

      const corsSettings: Partial<CORSSettings> = {
        exposeHeaders: ["X-Special-Header", "X-Another-Special-Header"],
      };

      (global.MAIN_KV as MockCloudflareKV).mockKv({
        "org-settings-walmart": { cors: corsSettings, orgExists: true },
      });

      response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Expose-Headers")).toBe(
        "X-Special-Header, X-Another-Special-Header"
      );
    });

    it(`adds access-control-max-age header`, async () => {
      let response: Response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      // Default max-age is 1 day
      expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");

      const corsSettings: Partial<CORSSettings> = {
        maxAge: 10,
      };

      (global.MAIN_KV as MockCloudflareKV).mockKv({
        "org-settings-walmart": { cors: corsSettings, orgExists: true },
      });

      response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Max-Age")).toBe("10");
    });

    it(`adds access-control-allow-credentials header`, async () => {
      let response: Response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
        "true"
      );

      const corsSettings: Partial<CORSSettings> = {
        allowCredentials: false,
      };

      (global.MAIN_KV as MockCloudflareKV).mockKv({
        "org-settings-walmart": { cors: corsSettings, orgExists: true },
      });

      response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
        "false"
      );
    });

    it(`optionally adds access-control-allow-methods header`, async () => {
      let response: Response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      // By default we allow GET-ish requests
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, HEAD, OPTIONS"
      );

      const corsSettings: Partial<CORSSettings> = {
        // Allow POST as well, view configuration
        allowMethods: ["GET", "HEAD", "OPTIONS", "POST"],
      };

      (global.MAIN_KV as MockCloudflareKV).mockKv({
        "org-settings-walmart": { cors: corsSettings, orgExists: true },
      });

      response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, HEAD, OPTIONS, POST"
      );
    });

    it(`optionally adds access-control-allow-headers header`, async () => {
      let response: Response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe(null);

      const corsSettings: Partial<CORSSettings> = {
        allowHeaders: ["X-Special-Header", "X-Another-Special-Header"],
      };

      (global.MAIN_KV as MockCloudflareKV).mockKv({
        "org-settings-walmart": { cors: corsSettings, orgExists: true },
      });

      response = await handleOptions(
        new Request("https://cdn.example.com/walmart/systemjs.importmap", {
          method: "OPTIONS",
          headers: {
            Origin: "walmart.com",
          },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
        "X-Special-Header, X-Another-Special-Header"
      );
    });
  });

  describe("same origin requests", () => {
    it("does not add CORS headers", async () => {
      const request = new Request(
        "https://cdn.example.com/walmart/systemjs.importmap",
        {
          method: "OPTIONS",
          headers: {
            Origin: "cdn.example.com",
          },
        }
      );
      const response: Response = await handleOptions(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(null);
    });
  });
});
