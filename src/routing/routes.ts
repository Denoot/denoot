import { declareStackItem } from "../stack.ts";
import { AllMethods, RouteCallback, DeclarePath, RoutePath, DeclareRouteOptions, DeclareRoute, Methods, MethodsLowerCase } from "../../types/definitions.d.ts";

import { State } from "../../mod.ts";

export const serializePath = (path: string) => {
    const trimmed = path
        .trim();

    // catch edge case
    if (trimmed === "/")
        return "/";

    return trimmed
        .replace(/\/{2,}/g, "/")
        .replace(/\/+$/, "");
}

export const trailingSlash = (path: string): boolean => {

    return !!path.replace(/\/\*$/, "/").match(/\/$/)?.[0]

}

export const trailingWildcard = (path: string): boolean => {

    return !!path.match(/\*$/)?.[0]

}

export const createParts = (path: string) => {

    const tempDomain = "http://example.com";
    const url = new URL(tempDomain + path);

    // URL URI encodes :(
    const parsedPathName = url
        .pathname
        .replace(/%7B/g, "{")
        .replace(/%7D/g, "}");

    const parsedPath = serializePath(parsedPathName);

    return parsedPath.split(/\//g);

}

export const extractVariable = (part: string) => {

    return part.match(/(?<={)(.*)(?=})/gm);

}

const createPath = (path: string): RoutePath => {

    if (!path.startsWith("/")) {
        throw new Error("Path must begin with forward slash (/)");
    }
    else if (path.match(/\s/)) {
        throw new Error("Path cannot include white space. If you must have white space URI encode the path");
    }

    const parts = createParts(path);

    return {
        original: serializePath(path),
        params: parts.map(part => {

            const extractedVariable = extractVariable(part);

            return {
                part,
                // a nullish coalescing expression does not work as a
                // type guard here. https://stackoverflow.com/a/61233021/13188385
                variable: extractedVariable !== null ? {
                    name: extractedVariable[0]
                } : null
            }
        })
    }

}

export const addRoute = (state: State, methods: AllMethods[], options?: DeclareRouteOptions): DeclareRoute => {

    const declareRoute = declareStackItem(methods, state);

    return (path: DeclarePath | RouteCallback, callback?: RouteCallback) => {

        const parsedCallback = typeof path === "function" ? path : callback;

        if (!parsedCallback) {
            throw new Error("Callback missing in route declaration.");
        }

        const definePath = typeof path === "function" ? "/*" : path;

        const parsedPaths = definePath instanceof Array ? definePath : [definePath] as string[];

        for (const path of parsedPaths) {
            declareRoute(createPath(path), parsedCallback, options);
        }

    }

}


export const get = (state: State) => addRoute(state, ["GET"]);
export const head = (state: State) => addRoute(state, ["HEAD"]);
export const post = (state: State) => addRoute(state, ["POST"]);
export const put = (state: State) => addRoute(state, ["PUT"]);
export const _delete = (state: State) => addRoute(state, ["DELETE"]);
export const connect = (state: State) => addRoute(state, ["CONNECT"]);
export const options = (state: State) => addRoute(state, ["OPTIONS"]);
export const trace = (state: State) => addRoute(state, ["TRACE"]);
export const patch = (state: State) => addRoute(state, ["PATCH"]);

export const any = (state: State) => addRoute(state, ["_ALL"]);

export const map = (state: State) =>
    (...methods: (Methods | MethodsLowerCase)[]) =>
    addRoute(state, methods.map(method => method.toUpperCase()) as Methods[]);

export const use = (state: State) => addRoute(state, ["_ALL"], { middleware: true });