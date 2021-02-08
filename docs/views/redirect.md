# Routing
## Redirect


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