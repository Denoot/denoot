# Wildcard Route

`*` inside a path denotes a wildcard path. It will match anything after that point.
## Wildcard Example
```ts
// example URL: http://example.com/users/123/name
app.get("/users/*", (req, res) => {
    res.send("Match!");
});

app.get("/users/123", (req, res) => {
    res.send("No Match.");
});
```

## As 404

You can easily override Denoot's built in 404 message by creating a catch all route at the bottom of your app.
```ts
app.any("/*", (req, res) => {
    res.html("<h1>Oh No! 404.</h1>");
});
```

Actually, you don't even need to specify `/*` since Denoot already defaults to this if you choose to omit the first argument.

Therefore the following is identical to the former.

```ts
app.any((req, res) => {
    res.html("<h1>Oh No! 404.</h1>");
});
```

test