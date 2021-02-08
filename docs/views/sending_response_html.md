# Routing
## Sending response
### HTML
```ts
app.get("/keyboards.html", (req: Denoot.Request, res: Denoot.Response)) => {
    res.html(`<h1>
        Keyboards are cool
    </h1>`);
});
```
