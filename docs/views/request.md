# Request

Denoot has a main `Request` class that organizes all the request methods/properties.

## Read Request Body

Consuming body from the request can be done by accessing `req.body`. Denoot will detect if the body is JSON and automatically parse it. If Denoot is unable to parse it will resolve as string.
```ts
app.post("/blog-post", async (req: Request, res: Response) => {
    const body = await req.body;

    console.log("body received:", body);

    res.send("Success!");
});
```
Verifying request body example.
```ts
app.post("/comment", async (req: Request, res: Response) => {
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
## Read URL Parameters

Read more on how to define and read URL parameters [here](https://denoot.dev/url-parameters).

```ts
req.method;
```

## Read Cookies
```ts
app.get("/", (req: Request, res: Response) => {
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
app.all((req: Request, res: Response) => {
    req.variables.set("likes", "ice cream");
});

app.post("/likes", (req: Request, res: Response) => {
    res.send("Everyone likes: " + req.variables.get("likes"));
});
```