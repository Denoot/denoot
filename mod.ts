import { serve } from "https://deno.land/std@0.85.0/http/server.ts";
import * as routes from "./src/routing/routes.ts";
import { RouteAdders, DenootState, ListeningCallback, RenderEngineCallback, RouteStackItem } from "./types/definitions.d.ts";
import { stackListener } from "./src/stack.ts";
import * as path from "https://deno.land/std@0.85.0/path/mod.ts";

import staticMiddleware from "./src/middleware/static.ts";



const createServer = ({ port, hostname }: DenootState) => {
    return serve({ port, hostname });
}

export class State {
    /** allow serving dotfiles
     * set this to true only if you know what you're doing
     */
    public allowDotFiles = false;
    /** number of seconds before closing the connection */
    public timeout: number = 30;
    /** the set of routes */
    public readonly routingStack: Set<RouteStackItem> = new Set();
    public renderer!: RenderEngineCallback;
    constructor(public options: DenootState) { }
}

const createDenootState = (port: number, hostname?: string) => {

    const localHostname = "127.0.0.1";
    const parsedHostname = hostname ?? localHostname;

    return new State({
        port,
        hostname: parsedHostname,
        baseURL: `http://${parsedHostname}:${port}`,
        localhostURL: `http://${localHostname}:${port}`
    });
}

/**
     * Creates a Denoot app.
     * @param port - The port to listen on
     * @param hostname - The hostname to listen on
     */
export const app = (port: number, hostname?: string, listeningCallback?: ListeningCallback): RouteAdders => {

    const state = createDenootState(port, hostname);

    const server = createServer(state.options);

    if (listeningCallback) {
        listeningCallback(state.options);
    }

    stackListener(state, server);

    return {
        get: routes.get(state),
        head: routes.head(state),
        post: routes.post(state),
        put: routes.put(state),
        delete: routes._delete(state),
        connect: routes.connect(state),
        options: routes.options(state),
        trace: routes.trace(state),
        patch: routes.patch(state),
        
        use: routes.use(state),
        any: routes.any(state),
        all: routes.any(state),

        map: routes.map(state),

        render: (callback: RenderEngineCallback) => {
            state.renderer = callback;
        },
        static: staticMiddleware(state)
    }

}



export default app;

/**
 * This is extremely infuriating but currently TSC does
 * not support `export type * from x` which is very sad :(
 */
export type {
    Request,
    Response,
    Next,
    Methods,
    MethodsLowerCase,
    AllMethod,
    AllMethods,
    DeclarePath,
    ListeningCallback,
    NextRoute,
    RouteBaseCallback,
    RouteCallback,
    DeclareRoute,
    RenderEngineCallback,
    RenderEngine,
    StaticCallback,
    StaticRouteBaseOptions,
    StaticRouteOptions,
    RoutePath,
    DeclareRouteOptions,
    RouteStackItem,
    DenootState
} from "./types/definitions.d.ts";