import { serve } from "https://deno.land/std@0.85.0/http/server.ts";
import * as routes from "./src/routing/routes.ts";
import { stackListener } from "./src/stack.ts";

import staticMiddleware from "./src/middleware/static.ts";
import cors from "./src/middleware/cors.ts";

import type from "./types/definitions.d.ts";

const createServer = ({ port, hostname }: Denoot.DenootState) => {
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
    public readonly routingStack: Set<Denoot.RouteStackItem> = new Set();
    public renderer!: Denoot.RenderEngineCallback;
    constructor(public options: Denoot.DenootState) { }
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
export const app = (port: number, hostname?: string, listeningCallback?: Denoot.ListeningCallback): Denoot.RouteAdders => {

    const state = createDenootState(port, hostname);

    const server = createServer(state.options);

    if (listeningCallback) {
        listeningCallback(state.options);
    }

    stackListener(state, server);

    const adders: Denoot.RouteAdders = {

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

        render: (callback: Denoot.RenderEngineCallback) => {
            state.renderer = callback;
        },
        static: staticMiddleware(state)
    }

    return {
        ...adders
    }

}

export default { app, cors };




export type Request = Denoot.Request;
export type Response = Denoot.Response;
export type Next = Denoot.Next;
export type Methods = Denoot.Methods;