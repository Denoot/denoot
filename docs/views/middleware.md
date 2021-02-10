# Middleware

Denoot middleware allow you to modify requests ass they pass through your app, you can put one at the top and control all requests. Common use cases are for caching, authenticating or blocking requests, but the sky's the limit, middleware are very powerful.
## Standard Middleware
`app.use` requires third parameter of the callback, `next`, to be called before the request can proceed. Every route except `app.use` can act as a middleware but __does not require `next` to be called__.
```ts
import Denoot, {
    Request,
    Response,
    Next
} from "https://deno.land/x/denoot/mod.ts";

app.use((req: Request, res: Response, next: Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});

app.get("/veggies/echo", (req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```
## Generic Route as Middleware
You can use any route to act like a middleware however Denoot will unlike `app.use` not await the third parameter `next` to be called before proceeding. Denoot will only await potential Promise.
__Note:__ You can define path(s) as the first parameter in `app.use`. Defaults to `/*`.
### Example of a Generic Middleware
Note the use of `app.all`
```ts
app.all((req, res) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
});

app.all((req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```