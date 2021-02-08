# Request / Response
## Body

Consuming body from the request can be done by accessing `req.body`. Denoot will detect if the body is JSON and automatically parse it. If Denoot is unable to parse it will resolve as string.
```ts
app.post("/blog-post", async (req: Denoot.Request, res: Denoot.Response) => {
    const body = await req.body;

    console.log("body received:", body);

    res.send("Success!");
});
```
Verifying request body example.
```ts
app.post("/comment", async (req: Denoot.Request, res: Denoot.Response) => {
    const body = await req.body;

    // filter strings
    if (typeof body !== "object") {
        return res
            .status(400)
            .send("Invalid JSON body!")
            .end();
    }

    console.table(body); // JS object/array
    
    res.send("Success!");
});
```