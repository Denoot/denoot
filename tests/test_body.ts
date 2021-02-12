import Denoot from "../mod.ts";

const app = Denoot.app(3000);

app.post("/", async (req, res) => {
    
    const body = await req.body as Denoot.JSONBody;

    res.send("ok")

});

app.post("/test", async (req, res) => {

    req
        .assert(await req.body instanceof Array)
        .accept(() => {
            res.send("nice payload");
        })
        .reject(() => {
            res.send("bad payload");
        })

});

app.post("/test2", (req, res) => {

    req
        .assert(res.sendFile("./mod.ts").then(res => res.getStatus !== 404))
        .accept(() => {
            console.log("File found")
        })
        .reject(() => {
            res.setHTML("File was not found");
        })
        .always(() => {
            console.log("Request received")
        })

});