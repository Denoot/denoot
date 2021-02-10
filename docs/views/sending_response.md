# Sending Response
## JSON
Denoot will detect if the type is of Array or Object and set application/json Content-Type header as a well as stringify the JSON.
As Object
```ts
app.post("/api/endpoint", (req, res) => {
    res.send({
        status: "Lookin' good!"
    });
});
```
Array works too
```ts
app.get("/api/yummy-fruits", (req, res) => {
    res.send([
        "Apple", "Banana", "Orange"
    ]);
});
```
__Note:__ if you send Array or Object more than one time Denoot will be unable to stringify the JSON and the response will be in plain text.

## Plain Text
```ts
app.get("/keyboards.html", (req, res) => {
    res.send(`Lookin' good. Slow down! My man.`);
});
```
## HTML
```ts
app.get("/keyboards.html", (req, res) => {
    res.html(`<h1>
        Keyboards are cool
    </h1>`);
});
```

## File

**Important:** `res.sendFile` is async. You must await the file read or Denoot will assume you don't want to await it. You can either await the promise or return a promise to tell Denoot to wait.
```ts
app.get("/static/video.mp4", (req, res) => {
    return res.sendFile("./static/video.mp4");
});
```
Please note the return statement in the above example.


## Uint8Array
```ts
app.get("/binary", (req, res) => {
    res.send(new Uint8Array([42, 69]);
});
```