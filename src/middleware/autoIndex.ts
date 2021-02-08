import * as path from "https://deno.land/std@0.85.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.85.0/fs/mod.ts";
import DenootResponse from "./../classes/DenootResponse.ts";
import DenootRequest from "./../classes/DenootRequest.ts";
import { AutoIndexRenderer, AutoIndexFile, AutoIndexRendererOptions } from "./../../types/definitions.d.ts";

/**
 * Generates autoindex html site
 * @author Fritiof Rusck <fritiof@rusck.se>
 */
export default async (req: DenootRequest, res: DenootResponse, path: string, renderer: AutoIndexRenderer): Promise<string> => {
    const files: AutoIndexFile[] = [];

    for await (const entry of walk(path, { maxDepth: 1 })) {
        files.push({
            name: entry.name,
            isDirectory: entry.isDirectory,
            isBack: entry.path === path,
            path: entry.path
        });
    }

    return await renderer({
        url: req.url,
        files
    });
};

export function autoIndexRenderer({ url, files }: AutoIndexRendererOptions) {
    let html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${url}</title>
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
        <body><div class="container"><h1>Index of ${url}</h1><hr><table>
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

    return html;

}