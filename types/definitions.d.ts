import type DenootRequest from "../src/classes/DenootRequest.ts";
import type DenootResponse from "../src/classes/DenootResponse.ts";

declare global {
    export namespace Denoot {

        export type Request = DenootRequest;
        export type Response = DenootResponse;
        export type Next = NextRoute;


        export type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
        export type MethodsLowerCase = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch";
        export type AllMethod = "_ALL";
        export type AllMethods = Methods | AllMethod;
        export type DeclarePath = string | string[];
        export type ListeningCallback = (state: DenootState) => unknown;
        export type NextRoute = (value: void | PromiseLike<void>) => void;
        export type RouteBaseCallback = (req: DenootRequest, res: DenootResponse, next: NextRoute) => unknown;
        export type RouteCallback = RouteBaseCallback | Promise<{ default: RouteBaseCallback }>;
        export type DeclareRoute = ((path: DeclarePath | RouteCallback, callback?: RouteCallback) => unknown);
        export type RenderEngineCallback = (filePath: string, options: any) => string | Promise<string>;
        export type RenderEngine = (renderCallback: RenderEngineCallback) => unknown;
        export type StaticCallback = (route: DeclarePath, options: StaticRouteOptions) => unknown;
        export type AllowedParameterTypes = "string" | "number" | "any" | "int";
        export type AutoIndexRenderer = (req: Request, res: Response, files: AutoIndexFile[]) => void;
        export type Cors = null | string | string[] | ((req: Request, res: Response, origin: string) => Promise<boolean> | boolean);


        export interface StaticRouteBaseOptions {
            index: string;
            autoIndex: boolean;
        }

        export interface StaticRouteOptions {
            folder: string;
            index?: string;
            autoIndex?: boolean | AutoIndexRenderer;
        }

        export interface Param {
            name: string,
            type: AllowedParameterTypes,
            raw: string,
            parsed: number | string | null,
            error: boolean
        }

        export interface RoutePath {
            original: string;
            params: {
                part: string;
                variable: null | {
                    name: string,
                    type: string
                }
            }[]
        }

        export interface DeclareRouteOptions {
            middleware?: boolean;
        }

        export interface RouteStackItem {
            methods: AllMethods[];
            path: RoutePath;
            callback: RouteBaseCallback;
            options?: DeclareRouteOptions
        }

        export interface DenootState {
            port: number;
            hostname?: string;
            baseURL: string;
            localhostURL: string;
        }

        export interface AutoIndexFile {
            name: string,
            isDirectory: boolean,
            isBack: boolean,
            path: string
        }


        export interface RouteAdders {
            /**
             * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
             */
            get: DeclareRoute;

            /**
             *  The HEAD method asks for a response identical to that of a GET request, but without the response body.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
             */
            head: DeclareRoute;

            /**
             * The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
             */
            post: DeclareRoute;

            /**
             * The PUT method replaces all current representations of the target resource with the request payload.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
             */
            put: DeclareRoute;

            /**
             * The DELETE method deletes the specified resource.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
             */
            delete: DeclareRoute;

            /**
             * The CONNECT method establishes a tunnel to the server identified by the target resource.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT
             */
            connect: DeclareRoute;

            /**
             * The OPTIONS method is used to describe the communication options for the target resource.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
             */
            options: DeclareRoute;

            /**
             * The TRACE method performs a message loop-back test along the path to the target resource.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/TRACE
             */
            trace: DeclareRoute;

            /**
             * The PATCH method is used to apply partial modifications to a resource.
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
             */
            patch: DeclareRoute;

            any: DeclareRoute;
            all: DeclareRoute;

            map: (...args: (Methods | MethodsLowerCase)[]) => DeclareRoute;

            /**
             * Use middleware. Requires third parameter in callback, Next, to be called before
             * request can proceed.
             */
            use: DeclareRoute;

            /**
             * Render a view
             */
            render: RenderEngine;

            /**
             * Serve files statically from given directory
             * @example
             * ```ts
             * app.static("/public/", {
             *   folder: "assets",
             *   autoIndex: true,
             * });
             * ```
             */
            static: StaticCallback;



        }

        export interface RouteAddersWithApp extends RouteAdders {
            app: RouteAdders
        }
    }
}