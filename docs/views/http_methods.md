# HTTP Methods
All supported [HTTP routing methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).
```ts
app.get("/path", callback);
app.head("/path", callback);
app.post("/path", callback);
app.put("/path", callback);
app.delete("/path", callback);
app.connect("/path", callback);
app.options("/path", callback);
app.trace("/path", callback);
app.get("/path", callback);
app.patch("/path", callback);
```
## Match All HTTP Methods
Match any HTTP method. `app.any` and `app.all` are aliases.
```ts
app.any("/path", callback);

```
## Match Specific HTTP Methods

Specific HTTP methods. You can define as many methods as you need.
```ts
app.map("get", "put", "patch")("/path", callback);
```