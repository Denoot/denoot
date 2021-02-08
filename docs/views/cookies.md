# Request / Response
## Cookies

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