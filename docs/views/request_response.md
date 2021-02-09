# Request / Response
## Reading Request Body

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

## Cookies

### Get Cookies
Simply read `req.cookies`.
```ts
app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    console.table("I got the following cookies:", req.cookies);

    res.send("Thanks for the yummy cookies");
});
```
### Set Cookie
Call `res.setCookie` with key, value and optionally options.
```ts
app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res
        .setCookie("cookie-type", "chocolate chip")
        .send("I sent you a cookie");
});
```
More options
```ts
app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res
        .setCookie("cookie-type", "chocolate chip", {
            secure: true,
            path: "/",
            maxAge: 60 * 15 // 15 minutes
        })
        .send("I sent you a cookie with options");
});
```

## Ending A Response

To make Denoot break the response meaning no other routes will be checked use `res.end()`. It's considered a good idea to do this when you have middleware or wildcard routes declared further back that might cause unwanted behavior.
```ts
// Example url: https://example.com/posts/all
app.get("/posts/all", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send([ "Post1", "Post2", "Post3" ]).end();
});

// This route will not be reached! Since res.end() was called earlier
app.get("/posts/{postID}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send(posts[ req.params.get("postID").parsed ]);
});
```
**Note:** If you have a lot of routes or very expensive routes/middleware it's considered best practice to use `res.end()` to prevent Denoot from checking further routes.


## Setting Status Code

Call `res.status(statusCode)` to set the response status code 
```ts
app.get("/fruits/*", (req: Denoot.Request, res: Denoot.Response) => {    
    res
        .status(404)
        .send("Not found!");
});
```