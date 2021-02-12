# Redirect

Redirect request to another location.
## External Redirect
Redirect to another URL.
```ts
app.get("/rick-roll", (req, res) => {
    res.redirect("https://youtu.be/dQw4w9WgXcQ");
});

```
## Permanent redirect
```ts
app.get("/new-site", (req, res) => {
    res.redirect("http://new.exmaple.com", true);
});

```
## Specified Status Code
(301, 302 or 308)
```ts
app.get("/", (req, res) => {
    res.redirect("/home", 308);
});
```