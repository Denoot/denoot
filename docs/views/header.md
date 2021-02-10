# Request / Response
## Headers

Denoot organizes the headers as Deno native Headers in `req.headers` and `res.headers`. If you prefer Object instead you can use the readonly property `res.headersObject` and respectively `req.headersObject`.
```ts
app.post("/admin/post", (req, res) => {
    req.headers.get("Authorization");

    res.headers.set("my-header", "fresh avocado");

    // alternatively
    res.setHeader("my-other-header", "header value"); // supports method chaining

    res.headers.get("my-header"); // "fresh avocado"
});
```
