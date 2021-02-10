import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(3000);

app.use((req: Denoot.Request, _res: Denoot.Response, next: Denoot.Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});

app.get("/vaggies/echo", (req, res) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"] 
});