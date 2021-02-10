import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(3000);

app.get("/rick-roll", (req: Request, res: Response) => {
    res.redirect("https://youtu.be/dQw4w9WgXcQ");
});

app.get("/", (req: Request, res: Response) => {
    res.setCookie("test", "value");
});