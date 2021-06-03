# Response

Denoot has a main `Response` class that organizes all the response methods/properties.

## Set Cookie
Call `res.setCookie` with key, value and optionally options.
```ts
app.get("/", (req, res) => {
    res
        .setCookie("cookie-type", "chocolate chip")
        .send("I sent you a cookie");
});
```
More options
```ts
app.get("/", (req, res) => {
    res
        .setCookie("cookie-type", "chocolate chip", {
            secure: true,
            path: "/",
            maxAge: 60 * 15 // 15 minutes
        })
        .send("I sent you a cookie with options");
});
```

## Set Header
**Method 1: as Map** `res.header.set(headerName, headerValue)`
```ts
app.get("/", (req, res) => {
    res.header.set("X-My-Header", "my-value");
    res.send("Here come headers");
});
```
**Method 2: as chainable method** `res.setHeader(headerName, headerValue)`
```ts
app.get("/", (req, res) => {
    res
        .setHeader("X-My-Header", "my-value")
        .send("Here come headers");
});
```

Want to read incoming headers? See [Request#headers](https://denoot.dev/request#read-headers).

## Ending a Response

To make Denoot break the response meaning no other routes will be checked use `res.end()`. It's considered a good idea to do this when you have middleware or wildcard routes declared further back that might cause unwanted behavior.
```ts
// Example url: https://example.com/posts/all
app.get("/posts/all", (req, res) => {
    res.send([ "Post1", "Post2", "Post3" ]).end();
});

// This route will not be reached! Since res.end() was called earlier
app.get("/posts/{postID}", (req, res) => {
    res.send(posts[ req.params.get("postID").parsed ]);
});
```
**Note:** If you have a lot of routes or very expensive routes/middleware it's considered best practice to use `res.end()` to prevent Denoot from checking further routes.


## Setting Status Code

Call `res.status(statusCode)` to set the response status code 
```ts
app.get("/fruits/*", (req, res) => {    
    res
        .status(404)
        .send("Not found!");
});
```

## Responding to a Request

Cheat sheet of Denoot's built in responses.

- [JSON](https://denoot.dev/sending-response#json)
- [Text](https://denoot.dev/sending-response#plain-text)
- [HTML](https://denoot.dev/sending-response#html)
- [File](https://denoot.dev/sending-response#file)
- [Uint8Array](https://denoot.dev/sending-response#uint8array)
- [Template](https://denoot.dev/render-template)


## Reset Old Body and Set New
```ts
// example URL: https://example.com/fruits/banana
app.get("/fruits/*", (req, res) => {    
    res.send("Apple");
});
app.get("/fruits/banana", (req, res) => {    
    res.setBody("Banana").end(); // "Banana"
});
```
**Note:** If you'd use `res.send` you would get "AppleBanana" since `res.send` appends a new body part.

## Reset Old Body and Set New HTML body
```ts
// example URL: https://example.com/links/denoot
app.get("/links/*", (req, res) => {    
    res.send("Apple");
});
app.get("/link/denoot", (req, res) => {    
    res.setHTML("<a href='https://denoot.dev'>Denoot!</a>"); // "<a href='https://denoot.dev'>Denoot!</a>"
});
```
**Note:** If you'd use `res.send` you would get "AppleBanana" since `res.send` appends a new body part.

## Redirect

Read more about redirects in Denoot [here](https://denoot.dev/redirect).

```ts
app.get("/home", (req, res) => {    
    res.redirect("/");
});
```
