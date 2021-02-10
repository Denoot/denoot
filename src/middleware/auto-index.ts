import { walk } from "https://deno.land/std@0.85.0/fs/mod.ts";

/**
 * Generates autoindex html site
 * @author Fritiof Rusck <fritiof@rusck.se>
 */
export default async (path: string): Promise<Denoot.AutoIndexFile[]> => {
    const files: Denoot.AutoIndexFile[] = [];

    for await (const entry of walk(path, { maxDepth: 1 })) {
        files.push({
            name: entry.name,
            isDirectory: entry.isDirectory,
            isBack: entry.path === path,
            path: entry.path
        });
    }

    return files;
};

export function autoIndexRenderer(req: Denoot.Request, res: Denoot.Response, files: Denoot.AutoIndexFile[]) {
    let html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${req.url}</title>
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    width: 100%;
                    
                }
                table * {
                    font-family: Courier New, Courier, Lucida Sans Typewriter;
                }
                tr {
                    display: block;
                    margin-bottom: 8px;
                }
                .container {
                    width: 90%;
                    margin-left: 5%;
                }
            </style>
        </head>
        <body><div class="container"><h1>Index of ${req.url}</h1><hr><table>
    `;

    const sortedFiles = files.sort(({ isDirectory: a, isBack: aB }, { isDirectory: b, isBack: bB }) => {
        if (aB) {
            return -1;
        }
        if (bB) {
            return 1;
        }

        if (a === b) {
            return 0;
        }
        if (a) {
            return -1;
        }
        return 1;
    });

    for (const file of sortedFiles) {
        const { name, isDirectory, path: _path, isBack } = file;
        const outputUrl = isBack ? ".." : ("./" + encodeURI(name) + (isDirectory ? "/" : ""));
        const outputName = isDirectory ? `${name}/` : name;

        html += `<tr><td><a href="${outputUrl}">${isBack ? ".." : outputName}</a></td></tr>`;
    }

    html += `</table><hr></div></body></html>`

    res.html(html);
}