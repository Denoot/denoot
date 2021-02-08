import { exists } from "https://deno.land/std@0.85.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.85.0/path/mod.ts";

import {
    DeclarePath,
    Next,
    Request,
    Response,
    StaticCallback,
    StaticRouteBaseOptions,
    StaticRouteOptions,
} from "../../types/definitions.d.ts";

import {
    addRoute,
    createParts,
    extractVariable,
    serializePath,
    trailingSlash,
    trailingWildcard,
} from "../routing/routes.ts";
import { State } from "../../mod.ts";
import autoIndex, { autoIndexRenderer } from "./auto-index.ts";

// legacy
// TODO cleanup
const createPath = (staticPath: string) =>
    (urlPath: string) => {
        return serializePath(`./${urlPath}`);
    };

const DEFAULT_STATIC_OPTIONS: StaticRouteBaseOptions = {
    index: "",
    autoIndex: false,
};

// _static must be used because ts strict mode complains
const _static = (state: State): StaticCallback =>
    async (routes: DeclarePath, options: StaticRouteOptions) => {
        const paths = (routes instanceof Array ? routes : [routes])
            .map((route) => {
                return route + (trailingSlash(route) ? "" : "/") +
                    (trailingWildcard(route) ? "" : "*");
            });

        const {
            folder: staticPath,
        } = {
            ...DEFAULT_STATIC_OPTIONS,
            ...options,
        };

        if (options.index && !options.index.startsWith(".")) {
            throw `Option options.index must begin with "." did you mean ".${options.index}"?`;
        }

        const getPath = createPath(staticPath);
        const tempDomain = "http://example.com";

        const staticProvider = async (_path: string) =>
            async (req: Request, res: Response, next: Next) => {
                const url = new URL(tempDomain + req.url);

                const splitUrl = [url.pathname];
                const urlPath = splitUrl[0];
                const base = getPath(decodeURI(urlPath));
                const parsedFilePath = path.resolve(
                    getPath(options.folder),
                    "./" + base.substr(_path.length + 1),
                );
                const stat = await Deno.stat(parsedFilePath).catch(() => null);

                if (
                    !stat || (stat.isDirectory && !options.autoIndex && !options.index)
                ) {
                    res.setError403().end();

                    return next();
                } else if (stat.isFile) {
                    (await res.sendFile(parsedFilePath)).end();

                    return next();
                }

                // check if the there's a trailing slash if not then redirect with trailing slash
                if (!trailingSlash(url.pathname) && stat.isDirectory) {
                    url.pathname = url.pathname + "/";

                    const withTrailingSlash = url.href.substr(tempDomain.length);

                    res.redirect(withTrailingSlash).end();

                    return next();
                }

                const indexPath = path.resolve(parsedFilePath, "index" + options.index);

                const index = options.index && await exists(indexPath);

                // found index file?
                if (index) {
                    (await res.sendFile(indexPath)).end();

                    return next();
                } else if (stat.isDirectory && !options.autoIndex) {
                    res.setError403().end();

                    return next();
                }

                const files = await autoIndex(parsedFilePath);
                const renderer = typeof options.autoIndex === 'function' ? options.autoIndex : autoIndexRenderer;

                renderer(req, res, files);

                return next();
            };

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
                middleware: true,
            })(path, await staticProvider(path.replace(/\/\*$/, "")));
        }
    };

export default _static;
