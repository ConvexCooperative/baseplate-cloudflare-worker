export function notFoundResponse(): Response {
  return new Response(
    JSON.stringify({
      errors: "Not Found",
    }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "public, max-age=300",
      },
    }
  );
}
