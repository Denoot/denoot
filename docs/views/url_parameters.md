# URL Parameters


Denoot organizes url parameters as a `Map<string, Param>` in `req.params`. If you prefer Object instead you can use the readonly property `req.objectParams`

```ts
app.get("/users/{userID: number}", (req: Denoot.Request, res: Denoot.Response)) => {
    if(req.params.get("userID").error) {
        // Oh no! userID couldn't be parsed
        return res.send("That's not a valid user id");
    }

    res.send("User ID: " + req.params.get("userID").parsed);
});
```
If you don't want to define a type opt-out of writing a type, Denoot will assume the param is of type string
```ts
app.get("/users/{name}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("Your name is of type: " + req.params.get("userID").type); // Will be string
});
```

The `Param` type looks like this:
```ts
interface Param {
    name: string, // name of param
    type: "string" | "number" | "any" | "int", // type of the param
    raw: string, // raw input
    parsed: number | string | null, // parsed input
    error: boolean  // boolean to show if there was a parsing error
}
```

**Note:** it's possible to set params using `req.params.set(key: string, value: Param)` however this is not recommended and is considered bad practice. Instead set custom variables using `req.variables.set("name", "value")`.