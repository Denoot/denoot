# Middleware
## Standard Middleware
`app.use` requires third parameter of the callback, `next`, to be called before the request can proceed. Every route except `app.use` can act as a middleware but __does not require `next` to be called__.
```ts
app.use((req: Denoot.Request, res: Denoot.Response, next: Denoot.Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});

app.get("/veggies/echo", (req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```
## Generic Route As Middleware
You can use any route to act like a middleware however Denoot will unlike `app.use` not await the third parameter `next` to be called before proceeding. Denoot will only await potential Promise.
__Note:__ You can define path(s) as the first parameter in `app.use`. Defaults to `/*`.
## Example Of a Generic Middleware
Note the use of `app.all`
```ts
app.all((req: Denoot.Request, res: Denoot.Response) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
});

app.get("/veggies/echo", (req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```