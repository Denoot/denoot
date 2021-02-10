import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(8000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`))

app.static("/public/", {
    folder: "tests",
    autoIndex: (req: Request, res: Response, files: Denoot.AutoIndexFile[]) => {
        res.html(files.map(v => v.name).join(" "));
    },
});

app.get("/lol/{ok}", (req: Request, res: Response) => {

    console.log(req.params);

});