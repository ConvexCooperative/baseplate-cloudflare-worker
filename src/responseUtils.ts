import { corsHeaders } from "./cors";
import { OrgSettings } from "@baseplate-sdk/utils";

export function notFoundResponse(
  request: Request,
  orgSettings?: OrgSettings
): Response {
  return new Response(
    JSON.stringify({
      errors: "Not Found",
    }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "public, max-age=0",
        ...corsHeaders(request, orgSettings),
      },
    }
  );
}

export function internalErrorResponse(
  request: Request,
  orgSettings?: OrgSettings
): Response {
  return new Response(
    "Baseplate Cloudflare worker failed. Check with customer support for assistance.",
    {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=UTF-8",
        "cache-control": "public, max-age=0",
        ...corsHeaders(request, orgSettings),
      },
    }
  );
}
