import { declareStackItem } from "../stack.ts";

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
        .replace(/%7D/g, "}")
        .replace(/%20/g, " ");

    const parsedPath = serializePath(parsedPathName);

    return parsedPath.split(/\//g);

}

export const extractVariable = (part: string): ({ name: string, type: Denoot.AllowedParameterTypes } | null) => {
    // First check to se if there's a : in the variable.
    const isTypeVariable = part.match(/(?<=({.*))(:)(?=(.*}))/);
    const paramTypes: Denoot.AllowedParameterTypes[] = ["string", "number", "any", "int"];

    if (isTypeVariable) {
        // Since isTypeVariable guarantees a match we can cast this to any,
        const varName: string = (part.match(/(?<={)(.*)(?=(:.*}))/gm) as any)[0].trim();
        const varType: string = (part.match(/(?<=({.*:))(.*)(?=})/gm) as any)[0].trim();

        if (!(paramTypes as any).includes(varType)) {
            throw new Error(`Type ${varType} is not a valid parameter type`);
        }

        return {
            name: varName,
            type: varType as Denoot.AllowedParameterTypes
        }
    } else {
        const varName = part.match(/(?<={)(.*)(?=})/gm);

        if (varName === null)
            return null

        return {
            name: varName[0],
            type: "string"
        };
    }
}

const createPath = (path: string): Denoot.RoutePath => {

    if (!path.startsWith("/")) {
        throw new Error("Path must begin with forward slash (/)");
    }
    // Since args can include {myVar: number} and white space is allowed there
    // We remove all occurrences of those first
    else if (path.replace(/(?<=({.*))\s*:\s*(?=(.*}))/, "").match(/\s/)) {
        throw new Error("Path cannot include white space. If you must have white space URI encode the path");
    }

    const parts = createParts(path);

    return {
        original: serializePath(path),
        params: parts.map(part => {

            const extractedVariable = extractVariable(part);

            return {
                part,
                variable: extractedVariable
            }
        })
    }

}

export const addRoute = (state: State, methods: Denoot.AllMethods[], options?: Denoot.DeclareRouteOptions): Denoot.DeclareRoute => {

    const declareRoute = declareStackItem(methods, state);

    return (path: Denoot.DeclarePath | Denoot.RouteCallback, callback?: Denoot.RouteCallback) => {

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
    (...methods: (Denoot.Methods | Denoot.MethodsLowerCase)[]) =>
        addRoute(state, methods.map(method => method.toUpperCase()) as Denoot.Methods[]);

export const use = (state: State) => addRoute(state, ["_ALL"], { middleware: true });
