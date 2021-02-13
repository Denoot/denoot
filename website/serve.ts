import Denoot, { Request, Response } from "../mod.ts";

// @deno-types="https://deno.land/x/fuse@v6.4.1/dist/fuse.d.ts"
import Fuse from "https://deno.land/x/fuse@v6.4.1/dist/fuse.esm.min.js";

import { build, Theme, themeify } from "./build.ts";
import DenootRequest from "../src/classes/DenootRequest.ts";



const views = await build();

const app = Denoot.app(
    3030,
    "0.0.0.0",
    ({ localhostURL }) => console.log(localhostURL),
);

app.static("/static", {
    folder: "website/assets",
    autoIndex: true,
});

app.use("/*", (req, res, next) => {
    
    req.variables.set("theme", req.cookies.theme ?? "light");

    if (!req.query.has("changeTheme")) return next();
    
    const { theme } = req.cookies;

    if (theme && theme === "dark") {
        res.setCookie("theme", "light", {
            path: "/"
        });
    } else {
        res.setCookie("theme", "dark", {
            path: "/"
        });
    }

    res.redirect(req.url.split("?")[0]).end();

    next();

});

for (const view of views) {
    app.get(view.url, (req, res) => {
        return sendFileWithTheme(req, res, view.htmlFilePath);
    });
}



app.get("/", (req, res) => {
    return sendFileWithTheme(req, res, "./website/dist/front-page.html");
});

function sendFileWithTheme(req: Denoot.Request, res: Denoot.Response, path: string) {

    const theme = req.variables.get("theme") as Theme;

    return res.sendFile(themeify(path, theme));
}

/* search */
const options = {
    includeScore: true,
    keys: [
        {
            name: "title",
            weight: .7
        },
        {
            name: "titlesArray",
            weight: .6
        },
        {
            name: "desc",
            weight: .4
        },
    ],
};

const fuse = new Fuse(views.map(view => {
    // not needed
    delete view.markup;

    return view
}), options);

app.get("/auto-complete/{query: string}", (req, res) => {

    const query = decodeURIComponent(req.params.get("query")?.raw ?? "");

    if (query.length < 1 || query.length > 1000)
        return res.status(404).send([]);

    const result = fuse.search(query);

    res.send(result.slice(0, 6));

});

app.get("/sitemap.xml", (req, res) => {

    return res.sendFile(`./website/dist/sitemap.xml`);

});

app.post("/api/gh", async (req, res) => {

    const body = await req.body as Denoot.JSONBody;

    res.send("ok").end();

    if (body.commits.some((v: { modified: string[] }) => v.modified.some(v => v.startsWith("docs") || v.startsWith("website")))) {

        console.log("Changes detected");

        const cmd = Deno.run({
            cmd: ["git", "pull"],
            stdout: "piped",
            stderr: "piped"
        });

        console.log(await cmd.output());

        cmd.close();

        await build();
    }

});

