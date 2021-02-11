import Denoot, { Request, Response } from "../mod.ts";

// @deno-types="https://deno.land/x/fuse@v6.4.1/dist/fuse.d.ts"
import Fuse from "https://deno.land/x/fuse@v6.4.1/dist/fuse.esm.min.js";

let { default: views } = await import("./build.ts");

const app = Denoot.app(
    4567,
    "0.0.0.0",
    ({ localhostURL }) => console.log(localhostURL),
);

app.static("/static", {
    folder: "website/assets",
    autoIndex: true,
});


for (const view of views) {
    app.get(view.url, (req, res) => {
        return res.sendFile(view.htmlFilePath);
    });
}

app.get("/", (req, res) => {
    return res.sendFile("./website/dist/front-page.html");
});


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
    console.log(body);
    if (body.commits.some((v: { modified: string }) => v.modified.startsWith("website"))) {
        views = (await import("./build.ts")).default;
    }

});