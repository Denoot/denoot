import * as Denoot from "../src/denoot.ts";

const app = Denoot.app(3000);

app.use((req: Denoot.Request, _res: Denoot.Response, next: Denoot.Next) => {
    req.variables.set("veggies", ["avocado", "carrot", "tomato"]);
    next();
});

app.get("/vaggies/echo", (req: Denoot.Request, res: Denoot.Response) => {
    res.send(req.variables.get("veggies")); // ["avocado","carrot","tomato"] 
});