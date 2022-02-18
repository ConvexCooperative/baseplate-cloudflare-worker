export function notFoundResponse(): Response {
  return new Response(
    JSON.stringify({
      errors: "Not Found",
    }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "public, max-age=0",
      },
    }
  );
}

export function internalErrorResponse(): Response {
  return new Response(
    "single-spa foundry Cloudflare worker failed. Check with customer support for assistance.",
    {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=UTF-8",
        "cache-control": "public, max-age=0",
      },
    }
  );
}
