import { walk } from "https://deno.land/std@0.85.0/fs/mod.ts";
import { Marked } from "https://deno.land/x/markdown/mod.ts";
import { Parsed } from "https://deno.land/x/markdown@v2.0.0/src/interfaces.ts";
import { compileFile } from "https://raw.githubusercontent.com/lumeland/pug/master/mod.js";
import icons from "./icons.ts";

export interface View {
    path: string;
    name: string;
    htmlFilePath: string;
    markup: Parsed;
    strippedName: string;
    url: string;
}

let views: Array<View> = [];

const headerItems = [
    {
        name: "Home",
        path: "#"
    },
    {
        name: "Getting started",
        path: "#"
    },
    {
        name: "Docs",
        path: "#"
    },
    {
        name: "About",
        path: "#"
    },
    {
        name: "",
        icon: icons.gitHub,
        path: "#"
    }
];
const decoder = new TextDecoder("utf-8");

const { order } = JSON.parse(decoder.decode(await Deno.readFile("./docs/docs.json"))) as ({
    order: string[]
});


for await (const { path, name } of walk("./docs/views", { includeDirs: false })) {

    const strippedName = name.replace(".md", "");

    if (!order.includes(strippedName)) continue;

    const url = "/" + urlIfy(strippedName);
    const markdown = decoder.decode(await Deno.readFile(path));
    const markup = Marked.parse(markdown);

    const htmlFilePath = `./website/dist/${name}.html`;

    views.push(JSON.parse(JSON.stringify({
        path,
        name,
        markup,
        htmlFilePath,
        strippedName,
        url
    })));

}


views = views.sort((x, y) => order.indexOf(x.strippedName) - order.indexOf(y.strippedName))

for (const view of views) {

    const compiled = await compileFile("./website/pug/base.pug", {})({
        views,
        view,
        headerItems
    });


    await Deno.writeTextFile(view.htmlFilePath, compiled);

}



export default views;

function urlIfy(str: string) {

    return str
        .replace(/[ _-]/g, "-")
        .toLowerCase();

}