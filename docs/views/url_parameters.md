# URL Parameters


## Basic example

```ts
app.get("/fruits/{fruitName}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("You like: " + req.params.get("fruitName").parsed);
});
```

***

## How It's made

Denoot organizes url parameters as a `Map<string, Param>` in `req.params`. If you prefer Object instead you can use the readonly property `req.objectParams`.

### Typed Parameters
Types, types and more types! Want to use different types in your url? No problem simply add a colon followed by one of: `string | number | any | int`.
#### Typed Parameter Example
Note the part `{userID: number}`, we set `UserID` as our parameter name and `number` as the type, simple right?
```ts
app.get("/users/{userID: number}", (req: Denoot.Request, res: Denoot.Response)) => {
    if (req.params.get("userID").error) {
        // Oh no! userID couldn't be parsed
        return res.send("Invalid User ID, try again!");
    }

    res.send("User ID: " + req.params.get("userID").parsed);
});



```

***

If you don't want to assign a type simply omit the typing of the parameter, Denoot will assume the param is of type string.
```ts
app.get("/users/{name}", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send("Param type: " + req.params.get("userID").type); // Will be string
});
```

The `Param` interface type looks like this:
```ts
interface Param {
    name: string, // name of param
    type: "string" | "number" | "any" | "int", // type of the param
    raw: string, // raw input
    parsed: number | string | null, // parsed input
    error: boolean  // boolean whether there occurred a parse error
}
```

**Note:** it's possible to set params using `req.params.set(key: string, value: Param)` however this is not recommended and is considered bad practice. Instead set custom variables using `req.variables.set("name", "value")`.