
# Multiple Paths/Routes

Denoot accepts either a string or an array of strings as paths.
```ts
app.get(["/api/path", "/api/path2"], (req, res) => {
    res.send("Hello There!");
});
``` 