# Wildcard Route

`*` inside a path denotes a wildcard path. It will match anything after that point.
## Example
```ts
// example URL: http://example.com/users/123/name
app.get("/users/*", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("Match!");
});

app.get("/users/123", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("No Match.");
});
```