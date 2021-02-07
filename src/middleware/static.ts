import { walkSync } from "https://deno.land/std@0.85.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.85.0/path/mod.ts";

import { Next, DeclarePath, StaticCallback, StaticRouteOptions, StaticRouteBaseOptions, Request, Response } from "../../types/definitions.d.ts";

import { addRoute, extractVariable, serializePath, createParts, trailingSlash, trailingWildcard } from "../routing/routes.ts";
import { State } from "../../mod.ts";

// legacy
// TODO cleanup
const createPath = (staticPath: string) => (urlPath: string) => {
    return serializePath(`./${urlPath}`);
}

const DEFAULT_STATIC_OPTIONS: StaticRouteBaseOptions = {
    index: "",
    autoIndex: false
}

// _static must be used because ts strict mode complains
const _static = (state: State): StaticCallback => (routes: DeclarePath, options: StaticRouteOptions) => {

    const paths = (routes instanceof Array ? routes : [routes])
        .map(route => {
            return route + (trailingSlash(route) ? "" : "/") + (trailingWildcard(route) ? "" : "*")
        });

    const {
        folder: staticPath
    } = {
        ...DEFAULT_STATIC_OPTIONS,
        ...options
    };

    if (options.index && !options.index.startsWith(".")) {
        throw `Option options.index must begin with "." did you mean ".${options.index}"?`;
    }

    const getPath = createPath(staticPath);
    const tempDomain = "http://example.com";

    const staticProvider = (_path: string) => async (req: Request, res: Response, next: Next) => {

        
        const url = new URL(tempDomain + req.url);

        const splitUrl = [url.pathname];
        const urlPath = splitUrl[0];
        const base = getPath(decodeURI(urlPath));
        const parsedFilePath = path.resolve(getPath(options.folder), "./" + base.substr(_path.length + 1));
        const stat = await Deno.stat(parsedFilePath).catch(() => null);

        if (!stat || (stat.isDirectory && !options.autoIndex && !options.index)) {
            res.setError403().end();

            return next();
        }
        else if (stat.isFile) {
            ; (await res.sendFile(parsedFilePath)).end();

            return next();
        }

        // check if the there's a trailing slash if not then redirect with trailing slash
        if (!trailingSlash(url.pathname) && stat.isDirectory) {
            url.pathname = url.pathname + "/";

            const withTrailingSlash = url.href.substr(tempDomain.length);

            res.redirect(withTrailingSlash).end();

            return next();
        }

        const title = `Index of ${base.replace(/^\.\//, "/")}`;

        const walkedItems = [...walkSync(parsedFilePath, {
            maxDepth: 1
        })]

        const index = options.index && walkedItems.find(item =>
            path.basename(item.name) === "index" + options.index
        );

        // found index file?
        if (index) {
            ; (await res.sendFile(path.resolve(parsedFilePath, index.name))).end();

            return next();
        } else if (stat.isDirectory && !options.autoIndex) {
            res.setError403().end();

            return next();
        }

        const autoIndex = walkedItems
            .reduce((t, { isDirectory, name, path: _path }) => {

                const isPrevious = _path === parsedFilePath;

                const basename = path.basename(name);

                // filter dot files unless specified otherwise
                if (basename.startsWith(".") && !state.allowDotFiles) {
                    return t;
                }

                return t + `<div>
                                <a href="${isPrevious ?
                        ".." :
                        "./" + encodeURI(name) + (isDirectory ? "/" : "")
                    }">
                        <div class="emoji">
                            <span role="img" alt="${isDirectory ? "directory icon" : "file icon"
                    }">
                                ${isDirectory ? "📁" : "📄"}
                            </span>
                        </div>
                        <span class="name">
                            ${isPrevious ? ".." : name}
                        </span>
                        </a>
                    </div>`;
            }, "");

        res.html(`
            <html>
                <head>
                    <title>${title}</title>
                    <meta charset="UTF-8">
                    <style>
                        a {
                            font-family: arial;
                            text-decoration: none;
                        }
                        a:hover .name {
                            text-decoration: underline;
                        }
                        a .name {
                            margin-left: 10px;
                        }
                        a .emoji {
                            display: inline-block;
                            width: 16px;
                            width: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    ${autoIndex}
                </body>
            </html>
        `).end();

        return next();

    }

    for (const path of (paths instanceof Array ? paths : [paths])) {
        /* check for parameters in declared route path(s) */
        const parts = createParts(serializePath(path));

        /* it's static, dynamic parameters are therefore useless,
        of course checked on declaration to avoid runtime errors. */
        if (parts.some(extractVariable)) {
            throw `URL path parameters cannot be defined on static method. See ${path}.`;
        }
        /* declares the middleware */
        addRoute(state, ["_ALL"], {
            middleware: true
        })(path, staticProvider(path.replace(/\/\*$/, "")));
    }




}




export default _static;