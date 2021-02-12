# Request

Denoot has a main `Request` class that organizes all the request methods/properties.

## Read Request Body

Consuming body from the request can be done by accessing `req.body`. Denoot will detect if the body is JSON and automatically parse it. If Denoot is unable to parse it will resolve as string.
```ts
app.post("/blog-post", async (req, res) => {
    const body = await req.body as Denoot.JSONBody; // trust input as json

    console.log("body received:", body);

    res.send("Success!");
});
```
Verifying request body example.
```ts
app.post("/comment", async (req, res) => {

    req
        .assert(await req.body instanceof Array)
        .accept(() => {
            res.send("Valid body");
        })
        .reject(() => {
            res.send("Invalid body");
        })

});
```

Read more about request assertions [here](#assert-condition).
## Read URL Parameters

Read more on how to define and read URL parameters [here](https://denoot.dev/url-parameters).

```ts
req.method;
```

## Read Cookies
```ts
app.get("/", (req, res) => {
    console.table("I got the following cookies:", req.cookies);

    res.send("Thanks for the yummy cookies");
});
```

Looking to set cookies? [`Response#setCookie`](https://denoot.dev/response#set-cookie)

## Read Method

```ts
req.method;
```

returns `Denoot.Methods`

```ts
type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
```

## Read Url

```ts
req.url;
```

returns `string`

## Read Headers

```ts
req.headers;
```

returns `Map<string, string>`

## Read Query

```ts
req.query;
```

returns `Map<string, string>`

## Read Custom Variables
Access custom variables set on another route.
```ts
req.variables;
```

returns `Map<string, string>`

## Set a Custom Variable
Use this to pass variables through requests.

```ts
app.all((req, res) => {
    req.variables.set("likes", "ice cream");
});

app.post("/likes", (req, res) => {
    res.send("Everyone likes: " + req.variables.get("likes"));
});
```

## Assert Condition
A common use case for Denoot is validating user input, while you of course can do this yourself however Denoot can help if you want it to. `req.assert` is a great way to structure validation.

You simply provide a condition which in some way (directly via promise or via callback) resolves a boolean. Then you declare `Assertion.accept` as a callback for when assertion was accepted and `Assertion.reject` as a callback for when assertion was rejected.
```ts
app.post("/test2", (req, res) => {

    req
        .assert(res.sendFile("./mod.ts").then(res => res.getStatus !== 404))
        .accept(() => {
            console.log("File found")
        })
        .reject(() => {
            res.setHTML("File was not found");
        })
        .always(() => {
            console.log("Request received")
        })

});
```
`Assertion.always` will always be called after an assertion has resolved.

**Note:** defining assertion has the added benefit of making Denoot await all assertions before proceeding to the next route.