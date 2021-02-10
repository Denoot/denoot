import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(3000);

app.get("/rick-roll", (req, res) => {
    res.redirect("https://youtu.be/dQw4w9WgXcQ");
});

app.get("/", (req, res) => {
    res.setCookie("test", "value");
});