# Best Practices
## Refactoring
It's recommended to refactor your routes into separate files. You can achieve this either by importing multiple routes from another file or importing one route from a single file with `export default`.

**Single route/file example**
```ts
// server.ts
app.get("/hello-world", import("./routes/helloWord.ts"));
```
```ts
// routes/helloWorld.ts
import { Request, Response } from "https://deno.land/x/denoot/mod.ts";

export default (req, res) => {
    res.send("Hello World!");
}
```
**Multiple routes/file example (destructured)**
You can also import routes as namespace `import * as routes from "./routes/user.ts";`.
```ts
// server.ts
import { login, logout } from "./routes/user.ts";

app.get("/user/login", login);
app.get("/user/logout", logout);
```
```ts
// routes/user.ts
import { Request, Response } from "https://deno.land/x/denoot/mod.ts";

export const login = (req: Request, res: Response) => {
    res.send("Welcome back!");
}
export const logout = (req: Request, res: Response) => {
    res.send("Bye!");
}
```

## Ending Requests

When your app is finished with the route, ending the request is a good idea to do for two main reasons. First and foremost it prevents unexpected unwanted behavior (side effects). This is because multiple routes can capture overlapping URL paths thereafter creating unintended responses because of the response stacking feature. See below example.
```ts
/* WARNING: this example shows how side effects can arise */
const products = {
    "1": "Hammer",
    "2": "Saw",
    "all": "Screwdriver" // ¯\_(ツ)_/¯
};

// Example URL: https://example.com/products/all
app.get("/products/all", (req, res) => {
    res.send(Object.values(products)); // "["Hammer", "Saw", "Screwdriver"]"
});

app.get("/products/{productID}", (req, res) => {
    const product = products[req.params.get("productID").parsed];
    res.send(product); // INVALID JSON: "["Hammer", "Saw", "Screwdriver"]Screwdriver"
});
```
**How to fix**; simply call `res.end()` in the first route.
```ts
/* ... */
app.get("/products/all", (req, res) => {
    res
        .send(Object.values(products)) // "["Hammer", "Saw", "Screwdriver"]"
        .end(); // Safe ﾉ(￣ｰ￣ )ﾉ
});
/* ... */
```
Secondly, ending a route is more performant than letting Denoot look through the rest of your routes.
## Cache Your Responses!
Nobody likes slow load speeds and especially not high server bills. Save time and money by caching your responses. You can use whichever caching method you like best, Denoot has no bias. The best way to do this is declaring a middleware route at the top of your application with a wildcard path like so: `app.use("/products/*"...` This middleware can interface with your awesome caching system, perhaps it's a tool like [Redis](#https://redis.io/) or just a humble JavaScript variable? Your middleware will likely check the cache age and determine if the request should proceed and interface the DB or end with a cached response. However, beware, unoptimized caching can lead to critically high memory usage that might only appear in production following lots of traffic. Please be careful!
## Static Routes

If you're using Denoot's `app.static` awesome! But please consider a few things; Deno is a JavaScript runtime meaning it does not have native performance of assembly, of course the benefit being amazingly dynamic apps. This means of course that using Denoot to statically serve content *can be* a bit overkill. If your app has lots and lots of traffic, serving your static content from Deno can be overwhelming and cpu intensive depending on your scale. Instead what you can do is use another web server that sits closer to the silicon in conjunction with Denoot. A solid and popular choice is using [NGINX](https://nginx.org/) for serving static content and then [reverse proxying](#https://en.wikipedia.org/wiki/Reverse_proxy) your dynamic endpoints to Denoot listening on your [LAN](https://en.wikipedia.org/wiki/Local_area_network). Just like that your app is super fast where expansive Deno is only used when needed.