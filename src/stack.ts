import * as HTTP from "https://deno.land/std@0.85.0/http/server.ts";

import { createParts } from "./routing/routes.ts";
import DenootResponse from "./classes/DenootResponse.ts";
import DenootRequest from "./classes/DenootRequest.ts";

import { State } from "../mod.ts";
import { middleWare404 } from "./middleware/errors.ts";

const debug = false;




/** Future proof abstraction to declare a route stack item */
export const declareStackItem = (methods: Denoot.AllMethods[], state: State) => (path: Denoot.RoutePath, callback: Denoot.RouteCallback, options?: Denoot.DeclareRouteOptions) => {

    const wait = typeof callback === "function" ? Promise.resolve(callback) : callback.then(d => d.default);

    wait.then(callback => {
        state.routingStack.add({
            methods,
            path,
            callback,
            options
        });
    });

}

const parseRequests = (server: HTTP.Server) => {

    /* console.log(server); */

    return server;

}

const isWildcard = (part: string) => part === "*";

/** matches incoming requests with declared route stack items */
const matchRequestWithRoute = (req: Denoot.Request, route: Denoot.RouteStackItem) => {

    const allMethods: Denoot.AllMethod = "_ALL";
    const { url: incomingPath, method: incomingMethod } = req;

    /* Match correct method
    For performance gains, if the method
    does not match simply exit the function
    instead of doing the other checks */
    if (!route.methods.includes(incomingMethod as Denoot.AllMethods) && !route.methods.includes(allMethods)) return false;

    const incomingParts = createParts(incomingPath);
    const declaredParts = route.path.params;

    debug && console.log(`${incomingParts}, ${route.path.params.map(v => v.part)}`)

    matchDeclaredPathParts: for (const [i, incomingPart] of incomingParts.entries()) {

        const declaredPart = declaredParts[i];

        if (!declaredPart)
            continue;

        debug && console.log(`Matching declared part "${declaredPart.part}" with incoming part "${incomingPart}"`);

        /* if a wild card appears it's implicit that the previous paths, if declared,
        is accepted because it's checked later in this block */

        if (isWildcard(declaredPart.part)) return true;

        if (declaredPart.variable && incomingPart) {
            const incomingParameter: Denoot.Param = {
                name: declaredPart.variable.name,
                type: declaredPart.variable.type as Denoot.AllowedParameterTypes,
                raw: incomingPart,
                parsed: null,
                error: false
            };

            // type checking for URL parameter
            switch (declaredPart.variable.type) {
                case "any":
                    incomingParameter.parsed = incomingPart;
                    break;
                case "string":
                    incomingParameter.parsed = incomingPart;
                    break;
                case "number":
                    const parsedNumber = parseFloat(incomingPart);
                    if (isNaN(parsedNumber)) {
                        incomingParameter.error = true;
                    } else {
                        incomingParameter.parsed = parsedNumber;
                    }
                    break;
                case "int":
                    const parsedInt = parseInt(incomingPart);
                    if (isNaN(parsedInt)) {
                        incomingParameter.error = true;
                    } else {
                        incomingParameter.parsed = parsedInt;
                    }
                    break;
            }


            req.params.set(declaredPart.variable.name, incomingParameter);

            continue matchDeclaredPathParts;
        }
        else if (declaredPart.part === incomingPart)
            continue matchDeclaredPathParts;
        else
            return false;

    }

    /* part mismatch, if either parts does not match and
    given previous wildcards were not detected return non match */
    if (declaredParts.length !== incomingParts.length) {
        if (isWildcard(declaredParts[incomingParts.length]?.part))
            return true;
        return false;
    }

    return true;

}

const awaitRoute = (req: Denoot.Request, res: Denoot.Response, callback: Denoot.RouteBaseCallback, options?: Denoot.DeclareRouteOptions) => {

    return new Promise<void>(async resolve => {

        await callback(req, res, resolve);

        if (!options?.middleware)
            resolve();
    });

}

export const stackListener = async (state: State, server: HTTP.Server) => {

    for await (const denoReq of parseRequests(server)) {

        // this anonymous async function is VERY important
        ; (async () => {

            const timeout = setTimeout(() => {
                denoReq.respond({ status: 408 });
            }, state.timeout * 1000);

            /* mutable, referenced response/request.
            I don't particularly like this way of coding however
            since the user most likely comes from an express background this
            is the most logical way of passing response/request states
            through routes. Slim.php has an immutable style however copying classes
            in php is much cheaper than js so I'll stick with instantiation/referencing
            for now */
            const res = new DenootResponse(state, denoReq);
            const req = new DenootRequest(state, denoReq);

            res._req = req;

            let e404 = true;
      

            searchStack: for (const routeStackItem of state.routingStack) {

                debug && console.log("Match request");

                const match = matchRequestWithRoute(req, routeStackItem);

                if (!match) continue searchStack;
                else if (e404) e404 = false;

                await awaitRoute(req, res, routeStackItem.callback, routeStackItem.options);

                if (res.ended) break searchStack;

            }

            clearTimeout(timeout);

            if(res.empty) {
                return denoReq
                    .respond({ body: "", headers: res.headers, status: 204 })
                    .catch(() => void 0);
            }

            const createdBody = res.buffer ?? res.body;


            if (e404 || !createdBody && !(res.getStatus >= 300 && res.getStatus < 400)) {
                // prompt 404 middleware
                await awaitRoute(req, res, middleWare404, {
                    middleware: true
                });
            }

            const updatedCreatedBody = res.buffer ?? res.body;

            denoReq
                .respond({ body: updatedCreatedBody, headers: res.headers, status: res.getStatus })
                .catch(() => void 0);

        })();

    }
}
