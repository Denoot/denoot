# Request / Response
## Setting Status Code

Call `res.status(statusCode)` to set the response status code 
```ts
app.get("/fruits/*", (req: Denoot.Request, res: Denoot.Response) => {    
    res
        .status(404)
        .send("Not found!");
});
```