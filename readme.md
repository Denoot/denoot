
<div align="center">
    <h1>
        Denoot — Web Server
    </h1>
    <img src="https://i.imgur.com/20W1wHg.png" alt="Denoot logo" style="width:200px;" width="200" />
    <p>Denoot is a light weight, high performance, express.js style web server/router for <a href="https://deno.land">Deno</a></p>
</div>

***

## Getting Started


server.ts
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);

app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res.send("Hello World!");
});
```
Then start the server:
```sh
deno run --allow-net --unstable server.ts
```
After starting open [localhost:3000](http://localhost:3000) 


***

## Table of Contents
 - [Introduction](#Denoot%20-%20a-deno-web-server)
 - [Getting Started](#getting-started)
 - API Reference
    - [Creating A Denoot App](#creating-a-denoot-app)
    - [Examples](#examples)
    - [Middleware](#middleware)
    - [Sending Response](#sending-response)
        - [Sending JSON](#json)
        - [Sending HTML](#html)
        - [Sending File](#file)
        - [Sending Uint8Array](#uint8array)
    - [HTTP Methods](#http-methods)
    - [URL Parameters](#url-parameters)
    - [URL Search Query](#URL-search-query)
    - [Cookies](#cookies)
      - [Get Cookies](#get-cookies)
      - [Set Cookie](#set-cookie)
    - [Consuming Request Body](#consuming-request-body)
    - [Setting Status Code](#setting-status-code)
    - [Static Routing](#static-routing)
    - [Request And Response Headers](#request-and-response-headers)
    - [Wildcard Route](#wildcard-route)
    - [Multiple Paths/Routes](#multiple-pathsroutes)
    - [Render Templates](#render-templates)
        - [Handlebars Example](#handlebars-example)
        - [Custom Rendering Engine](#custom-rendering-engine)
    - [Redirect](#redirect)
- [Best Practices](#best-practices)
    - [Refactoring](#refactoring)
    - [Ending Requests](#ending-requests)
    - [Cache Your Responses!](#cache-your-responses!)
    - [Static Routes](#static-routes)
- [What Is Denoot?](#what-is-denoot)
- [Security Concerns](#security-concerns)
- [Contribute](#contribute)
- [To Do](#to-do)


## Creating A Denoot App
[⬆️ Table of Contents ⬆️](#table-of-contents)

To create app you must at least provide `port`. `host` is optional and will default to "127.0.0.1". `callback` is optional and will return an object of the listening state.
### Examples — Pick Your Poison

```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000, "0.0.0.0", console.table);
```

```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000, "localhost", ({ localhostURL }) => console.log(`Listening on ${localhostURL}.`));
```
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);
```

## Middleware
[⬆️ Table of Contents ⬆️](#table-of-contents)

`app.use` requires third parameter of the callback, `next`, to be called before the request can proceed. Every route except `app.use` can act as a middleware but __does not require `next` to be called__.
```ts
app.use((req: Denoot.Request, _res: Denoot.Response, next: Denoot.Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});

app.get("/veggies/echo", (req: Denoot.Request, res: Denoot.Response) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"]
});
```
__Note:__ You can define path(s) as the first parameter in `app.use`. Defaults to `/*`. 



## Sending response
[⬆️ Table of Contents ⬆️](#table-of-contents)

### JSON
Denoot will detect if the type is of Array or Object and set application/json Content-Type header as a well as stringify the JSON.
As Object
```ts
app.post("/api/endpoint", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send({
        status: "Lookin' good!"
    });
});
```
Array works too
```ts
app.get("/api/yummy-fruits", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send([
        "Apple", "Banana", "Orange"
    ]);
});
```
__Note:__ if you send Array or Object more than one time Denoot will be unable to stringify the JSON and the response will be in plain text.
### HTML
```ts
app.get("/keyboards.html", (req: Denoot.Request, res: Denoot.Response)) => {
    res.html(`<h1>
        Keyboards are cool
    </h1>`);
});
```
### File
```ts
app.get("/static/video.mp4", (req: Denoot.Request, res: Denoot.Response)) => {
    res.sendFile("./static/video.mp4");
});
```
### Uint8Array
```ts
app.get("/binary", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send(new Uint8Array([42, 69]);
});
```

## HTTP Methods
[⬆️ Table of Contents ⬆️](#table-of-contents)


All supported routing [HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).
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
Match any HTTP method. `app.any` and `app.all` are aliases.
```ts
app.any("/path", callback);
```
Specific HTTP methods. You can define as many methods as you need.
```ts
app.map("get", "put", "patch")("/path", callback);
```

## URL Parameters
[⬆️ Table of Contents ⬆️](#table-of-contents)


Denoot organizes url parameters as a `Map<string, string>` in `req.params`. If you prefer Object instead you can use the readonly property `req.objectParams`
```ts
app.get("/users/{userID}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("User ID: " + req.params.get("userID"));
});
```
**Note:** it's possible to set params using `req.params.set(key: string, value: string)` however this is not recommended and is considered bad practice. Instead define custom properties on `Request`.

## URL Search Query
[⬆️ Table of Contents ⬆️](#table-of-contents)


Denoot organizes the url search query as a `Map<string, string>` in `req.query`. If you prefer Object instead you can use the readonly property `req.objectQuery`
```ts
// Example url: https://example.com/fruits/search?searchterm=apples&direction=desc
app.get("/fruits/search", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send(
        `You searched for: "${req.query.get("searchterm")}" and sorted ${req.query.get("direction")}`
    ); // Will output: You searched for: "apples" and sorted desc
});
```
**Note:** it's possible to set query using `Request.params.set(key: string, value: string)` however this is not recommended and is considered bad practice. Instead define custom properties on `Request`.


## Cookies
[⬆️ Table of Contents ⬆️](#table-of-contents)


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

## Consuming Request Body
[⬆️ Table of Contents ⬆️](#table-of-contents)

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

**Warning:** It's imperative to guard against attacks! Reject large bodies by checking `req.denoReq.contentLength`.

**Note:** The body is only read into memory if the getter `req.body` is read somewhere in your app.

## Setting Status Code
[⬆️ Table of Contents ⬆️](#table-of-contents)

Call `res.status(statusCode)` to set the response status code 
```ts
app.get("/fruits/*", (req: Denoot.Request, res: Denoot.Response) => {    
    res
        .status(404)
        .send("Not found!");
});
```

## Static Routing
[⬆️ Table of Contents ⬆️](#table-of-contents)


Denoot makes it easy to statically serve files from a given folder. This means that Denoot will look inside a folder and try to match it with the URL. This feature is meant to be used when you need to serve responses that aren't dynamically generated by your app. A very common use case is serving website assets such ass css, js, images etc.
### Examples
Here `/public` will act as an alias to the local folder `static`. If provided `options.folder` is relative, the root wil be from where you started your deno app.
```ts
app.static("/public", {
    folder: "static"
});
```
Enable auto indexing. Providing `options.autoIndex` as `true` will tell Denoot to create a directory index if the given URL resolves to a __directory__.
```ts
app.static("/public", {
    folder: "static",
    autoIndex: true
});
```
Enable index files. If you want Denoot to look for en index file upon resolving to a directory, set `options.index` to your file extension for example: `.html` where `index.html` will be served if found inside the directory.
```ts
app.static("/public", {
    folder: "static",
    index: ".html"
});
```

__Note:__ By default Denoot will **not** allow [dotfiles](https://en.wikipedia.org/wiki/Hidden_file_and_hidden_directory) to be served or displayed in auto index. If you absolutely, 100% know what you're doing you can change this behavior by setting `res.state.allowDotFiles` to `true`.


## Request And Response Headers
[⬆️ Table of Contents ⬆️](#table-of-contents)


Denoot organizes the headers as Deno native Headers in `req.query`. If you prefer Object instead you can use the readonly property `res.headersObject` and respectively `req.headersObject`.
```ts
app.post("/admin/post", (req: Denoot.Request, res: Denoot.Response)) => {
    req.headers.get("Authorization");

    res.headers.set("my-header", "fresh avocado");

    // alternatively
    res.setHeader("my-other-header", "header value"); // supports method chaining

    res.headers.get("my-header"); // "fresh avocado"
});
```
## Ending A Response
[⬆️ Table of Contents ⬆️](#table-of-contents)


To make Denoot break the response meaning no other routes will be checked use `res.end()`. It's considered a good idea to do this when you have middleware or wildcard routes declared further back that might cause unwanted behavior.
```ts
// Example url: https://example.com/posts/all
app.get("/posts/all", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send([ "Post1", "Post2", "Post3" ]).end();
});

// This route will not be reached! Since res.end() was called earlier
app.get("/posts/{postID}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send(posts[ req.params.get("postID") ]);
});
```
**Note:** If you have a lot of routes or very expensive routes/middleware it's considered best practice to use `res.end()` to prevent Denoot from checking further routes. 

## Wildcard Route
[⬆️ Table of Contents ⬆️](#table-of-contents)



"`*`" inside a path denotes a wildcard path. It will match anything after that point.
### Examples
```ts
// example URL: http://example.com/users/123/name
app.get("/users/*", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("Match!");
});

app.get("/users/123", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("No Match.");
});
```

## Multiple Paths/Routes
[⬆️ Table of Contents ⬆️](#table-of-contents)


Denoot accepts either a string or an array of strings as paths.
```ts
app.get(["/api/path", "/api/path2"], (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("Hello There!");
});
```

## Render Templates
[⬆️ Table of Contents ⬆️](#table-of-contents)


### Handlebars Example
Simple handlebars for Deno example.
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";
import { Handlebars } from "https://deno.land/x/handlebars/mod.ts";

const app = Denoot.app(3000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`));
const handle = new Handlebars();

app.render(handle.renderView.bind(handle));

app.get("/user/{username}", async (req: Denoot.Request, res: Denoot.Response) => {
    // assumes ./views/user.hbs and ./views/layouts.main.hbs exists. See https://deno.land/x/handlebars
    await res.render("user", {
        firstname: req.params.get("username"),
        lastname: "Doe"
    });
});
```
See [handlebars for Deno documentation](https://deno.land/x/handlebars) and [handlebars.js guide](https://handlebarsjs.com/guide/) for more information.


### Custom Rendering Engine
Denoot supports rendering templates by declaring a template rendering callback.
```ts
const renderer: Denoot.RenderEngineCallback;
app.render(renderer);
```
You can easily use any template engine you want by satisfying the following callback type.
```ts
type RenderEngineCallback = (filePath: string, options: any) => string | Promise<string>;
```
After you've declared your rendering engine callback you gain access to `res.render`. This is merely an abstraction for calling the defined rendering engine callback.
```ts
app.get("/home", async (req: Denoot.Request, res: Denoot.Response) => {
    await res.render("home-page", {
        user: {
            name: "John Doe"
        }
    });
});
```
In the above example Denoot will render the template "home-page" with the provided options. "Views" folder and default file extension are handled by the rendering engine. Please note: your engine might require you to include the file extension.

## Redirect
[⬆️ Table of Contents ⬆️](#table-of-contents)


Redirect to another URL.
```ts
app.get("/rick-roll", (req: Denoot.Request, res: Denoot.Response) => {
    res.redirect("https://youtu.be/dQw4w9WgXcQ");
});
```
Permanent redirect
```ts
app.get("/new-site", (req: Denoot.Request, res: Denoot.Response) => {
    res.redirect("http://new.exmaple.com", true);
});
```
Specified code (301, 302 or 308)
```ts
app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res.redirect("/home", 308);
});
```

***

## What Is Denoot?

Denoot pronounced "Dea-noot" is a Deno module to dynamically route/manage incoming HTTP requests. Denoot can be used as a web framework if so desired. Denoot's focus is speed, reliability and ease of use. It's not made to solve all web related problems. Its purpose is to route incoming HTTP requests and provide the expected features features of a web server.

Denoot was inspired by popular Node.js web framework express.js **however** Denoot is **NOT** the same as express.js, Denoot was developed independently and only borrows some syntax/structure from express.js. Since Deno is very different from Node.js it uses Deno's native features to abstract HTTP routing. Denoot is written in 100% typescript.
## Best Practices

### Refactoring
It's recommended to refactor your routes into separate files. You can achieve this either by importing multiple routes from another file or importing one route from a single file with `export default`.

**Single route/file example**
```ts
// server.ts
app.get("/hello-world", import("./routes/helloWord.ts"));
```
```ts
// routes/helloWorld.ts
import { Request, Response } from "https://deno.land/x/denoot/mod.ts";

export default (req: Request, res: Response) => {
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
import { Request, Response } from "../https://deno.land/x/denoot/mod.ts";

export const login = (req: Request, res: Response) => {
    res.send("Welcome back!");
}
export const logout = (req: Request, res: Response) => {
    res.send("Bye!");
}
```

### Ending Requests

When your app is finished with the route, ending the request is a good idea to do for two main reasons. First and foremost it prevents unexpected unwanted behavior (side effects). This is because multiple routes can capture overlapping URL paths thereafter creating unintended responses because of the response stacking feature. See below example.
```ts
/* WARNING: this example shows how side effects can arise */
const products = {
    "1": "Hammer",
    "2": "Saw",
    "all": "Screwdriver" // ¯\_(ツ)_/¯
};

// Example URL: https://example.com/products/all
app.get("/products/all", (req: Denoot.Request, res: Denoot.Response) => {
    res.send(Object.values(products)); // "["Hammer", "Saw", "Screwdriver"]"
});

app.get("/products/{productID}", (req: Denoot.Request, res: Denoot.Response) => {
    const product = products[req.params.get("productID")];
    res.send(product); // INVALID JSON: "["Hammer", "Saw", "Screwdriver"]Screwdriver"
});
```
**How to fix**; simply call `res.end()` in the first route.
```ts
/* ... */
app.get("/products/all", (req: Denoot.Request, res: Denoot.Response) => {
    res
        .send(Object.values(products)) // "["Hammer", "Saw", "Screwdriver"]"
        .end(); // Safe ﾉ(￣ｰ￣ )ﾉ
});
/* ... */
```
Secondly, ending a route is more performant than letting Denoot look through the rest of your routes.
### Cache Your Responses!
Nobody likes slow load speeds and especially not high server bills. Save time and money by caching your responses. You can use whichever caching method you like best, Denoot has no bias. The best way to do this is declaring a middleware route at the top of your application with a wildcard path like so: `app.use("/products/*"...` This middleware can interface with your awesome caching system, perhaps it's a tool like [Redis](#https://redis.io/) or just a humble JavaScript variable? Your middleware will likely check the cache age and determine if the request should proceed and interface the DB or end with a cached response. However, beware, unoptimized caching can lead to critically high memory usage that might only appear in production following lots of traffic. Please be careful!
### Static Routes

If you're using Denoot's `app.static` awesome! But please consider a few things; Deno is a JavaScript runtime meaning it does not have native performance of assembly, of course the benefit being amazingly dynamic apps. This means of course that using Denoot to statically serve content *can be* a bit overkill. If your app has lots and lots of traffic, serving your static content from Deno can be overwhelming and cpu intensive depending on your scale. Instead what you can do is use another web server that sits closer to the silicon in conjunction with Denoot. A solid and popular choice is using [NGINX](https://nginx.org/) for serving static content and then [reverse proxying](#https://en.wikipedia.org/wiki/Reverse_proxy) your dynamic endpoints to Denoot listening on your [LAN](https://en.wikipedia.org/wiki/Local_area_network). Just like that your app is super fast where expansive Deno is only used when needed.

## Security Concerns
If you have any security concerns please open an issue on the Denoot Github repository.
## Contribute
- We're always happy to receive contributions ranging from opening issues to making pull requests.
- You can also help by improving the Denoot ecosystem, feel free to create custom third party middleware!
- Found an issue with this documentation? Edit it!

## To Do
 - Regex path matching
 - Move documentation to a dedicated website :(
 - Send xml
 - Docs for Response and Request classes (for now see JS doc inside code)

[⬆️ Table of Contents ⬆️](#table-of-contents)

~ Made with ❤️ in Stockholm