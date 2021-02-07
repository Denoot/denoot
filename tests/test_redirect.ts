import * as Denoot from "../mod.ts";

const app = Denoot.app(3000);

app.get("/rick-roll", (req: Denoot.Request, res: Denoot.Response) => {
    res.redirect("https://youtu.be/dQw4w9WgXcQ");
});

app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res.setCookie("test", "value");
});