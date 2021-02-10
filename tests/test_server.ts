import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(3000);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});


