# URL Search Query
Denoot organizes the url search query as a `Map<string, string>` in `req.query`. If you prefer Object instead you can use the readonly property `req.objectQuery`

Read more about Denoot Request [here](https://denoot.dev/request).

```ts
// Example url: https://example.com/fruits/search?searchterm=apples&direction=desc
app.get("/fruits/search", (req: Denoot.Request, res: Denoot.Response)) => {
    res.send(
        `You searched for: "${req.query.get("searchterm")}" and sorted ${req.query.get("direction")}`
    ); // Will output: You searched for: "apples" and sorted desc
});
```
**Note:** it's possible to set query using `Request.query.set(key: string, value: string)` however this is not recommended and is considered bad practice. Instead define custom variables using `req.variables.set("name", "value")`. See [Request#variables](https://denoot.dev/request#set-a-custom-variable)

