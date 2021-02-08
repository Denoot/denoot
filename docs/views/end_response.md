# Request / Response
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