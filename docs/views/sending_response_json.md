# Routing
## Sending response
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
