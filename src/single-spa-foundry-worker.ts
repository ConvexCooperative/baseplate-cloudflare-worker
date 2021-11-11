addEventListener("fetch", (evt: FetchEvent) => {
  const body = JSON.stringify({
    hello: "world",
  });
  return evt.respondWith(
    new Response(body, {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    })
  );
});
