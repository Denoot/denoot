# Routing
## Middleware
`app.use` requires third parameter of the callback, `next`, to be called before the request can proceed. Every route except `app.use` can act as a middleware but __does not require `next` to be called__.
```ts
app.use((req, _res, next: Denoot.Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});


app.get("/veggies/echo", (req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```
__Note:__ You can define path(s) as the first parameter in `app.use`. Defaults to `/*`. 