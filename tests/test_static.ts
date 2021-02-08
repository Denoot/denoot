import * as Denoot from "../mod.ts";

const app = Denoot.app(8000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`))

app.static("/public/", {
    folder: "tests",
    autoIndex: true,
});

app.get("/lol/{ok}", (req: Denoot.Request, res: Denoot.Response) => {

    console.log(req.params);

});