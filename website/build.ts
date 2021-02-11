import { walk } from "https://deno.land/std@0.85.0/fs/mod.ts";
import { Marked } from "https://deno.land/x/markdown/mod.ts";
import { Parsed } from "https://deno.land/x/markdown@v2.0.0/src/interfaces.ts";
import { compileFile } from "https://raw.githubusercontent.com/lumeland/pug/master/mod.js";
import icons from "./icons.ts";
import {
    DOMParser,
    Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

let sitemap: string[] = [];

console.log("Generating docs");
export interface View {
    path: string;
    name: string;
    htmlFilePath: string;
    markup?: Parsed;
    strippedName: string;
    url: string;
    title: string;
    desc: string;
    titlesArray: string[];
    titles: {
        content: string;
        tagName: string;
        fragment: string;
    }[];
    docs: boolean;
}

let views: Array<View> = [];

const headerItems = [
    {
        name: "Home",
        path: "/",
    },
    {
        name: "Getting started",
        path: "/getting-started",
    },
    {
        name: "Docs",
        path: "/creating-denoot-app",
    },
    {
        name: "",
        icon: icons.gitHub,
        path: "https://github.com/Denoot/denoot",
    },
];
const decoder = new TextDecoder("utf-8");

const { order } = JSON.parse(
    decoder.decode(await Deno.readFile("./docs/docs.json")),
) as ({
    order: string[];
});

for await (
    const { path, name } of walk("./docs/views", { includeDirs: false })
) {
    const strippedName = name.replace(".md", "");



    const url = "/" + urlIfy(strippedName);
    const markdown = decoder.decode(await Deno.readFile(path));
    const markup = Marked.parse(markdown);

    const doc = new DOMParser().parseFromString(markup.content, "text/html")!;

    const title = doc.querySelector("h1")!;

    const desc = doc.querySelector("p")!;

    if (!title) {
        throw `${path} does not contain a h1 tag`;
    }

    const htmlFilePath = `./website/dist/${name}.html`;

    const titles = [...doc.querySelectorAll("[id]")].map((el) => {
        const element = el as Element;

        return {
            content: el.textContent,
            tagName: el.nodeName,
            fragment: element.attributes.id,
        };
    })

    const view: View = {
        title: title.textContent,
        titles,
        titlesArray: titles.map(v => v.content).slice(1),
        desc: desc?.textContent ?? "Denoot documantion",
        path,
        name,
        markup,
        htmlFilePath,
        strippedName,
        url,
        docs: order.includes(strippedName)
    }

    // remove annoying reference
    views.push(JSON.parse(JSON.stringify(view)));
}

views = views.sort((x, y) =>
    order.indexOf(x.strippedName) - order.indexOf(y.strippedName)
);

for (const view of views) {

    await buildPage(view.url, view.htmlFilePath, "./website/pug/base.pug", {
        views: views.filter(v => v.docs),
        view,
        headerItems,
    });

}


function urlIfy(str: string) {
    return str
        .replace(/[ _-]/g, "-")
        .toLowerCase();
}



// Generate front page
await buildPage("/", "./website/dist/front-page.html", "./website/pug/home.pug", {
    headerItems,
    getting_started: views.find(view => view.title === "Getting Started"),
    what_is_denoot: views.find(view => view.title === "What is Denoot?")
});



/**
 * Generates HTML from pug
 */
async function buildPage(url: string, htmlOutput: string, pugjsTemplate: string, options?: Record<string, unknown>) {

    
    sitemap.push(`
   <url>
      <loc>https://denoot.dev${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>`);


    const compiled = await compileFile(pugjsTemplate, {})({
        ...(options ?? {}),
        burgerIcon: icons.burger
    });

    await Deno.writeTextFile(htmlOutput, compiled
        .replace(/\(req: Request, res: Response\)/g, `(req: <span class="hljs-built_in">Request</span>, res: <span class="hljs-built_in">Response</span>)`)
        .replace(/\(req: Request, res: Response\)/g, `(req: <span class="hljs-built_in">Request</span>, res: <span class="hljs-built_in">Response</span>, next: <span class="hljs-built_in">Next</span>)`)

    );

    console.log(`Built ${url} successfully`);

}

await Deno.writeTextFile(`./website/dist/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${sitemap.join("")}
</urlset>
`);



export default views.filter(v => v.docs);
