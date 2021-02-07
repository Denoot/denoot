import * as Denoot from "../mod.ts";

const app = Denoot.app(3000);

app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res.send("Hello World!");
});