import { ServerRequest } from "https://deno.land/std@0.85.0/http/server.ts";

import { State } from "../../mod.ts";
import { parseCookies } from "../cookieParser/cookieParser.ts";
import { decode } from "https://deno.land/std@0.85.0/encoding/utf8.ts";


/**
 * The HTTP request as abstracted by Denoot
 * @class DenootRequest 
 */
class DenootRequest {

    private _url: string = "";
    private _method: Denoot.AllMethods;
    private _params: Map<string, Denoot.Param> = new Map();
    private _query: Map<string, string> = new Map();
    private _variables: Map<string, any> = new Map();
    private _headers: Headers;
    private _assertions: (boolean | Promise<boolean>)[] = [];
    private _bodyCache: string | Denoot.JSONBody | any[] | null = null;
    public _res!: Denoot.Response;

    
    /**
     * @internal
     */
    constructor(public readonly state: State, public readonly denoReq: ServerRequest) {
        
        this._url = denoReq.url;
        this._method = denoReq.method as Denoot.AllMethods;
        this._headers = denoReq.headers;
        
        for (const [ key, value ] of new URLSearchParams(denoReq.url.split("?")?.[1])) {
            this.query.set(key, value);
        }

    }


    get body(): Promise<string | Denoot.JSONBody | any[]> {

        if (this._bodyCache) {
            return Promise.resolve(this._bodyCache);
        }

        return this._bodyCache = (async () => {
            const buffer = await Deno.readAll(this.denoReq.body);
            const decoder = new TextDecoder();
            const decoded = decoder.decode(buffer);

            if (decoded.startsWith("{") || decoded.startsWith("[")) {
                try {
                    return JSON.parse(decoded);
                } catch(e) {}
            }

            return decoded;
        })();

    }

    /**
     * The HTTP method
     */
    get method() { return this._method }

    /**
     * The incoming URL
     */
    get url() { return this._url }

    /**
     * The URL parameters if declared in route path
     */
    get params() { return this._params }

    /**
     * Request headers
     */
    get headers() { return this._headers }

    /**
     * The URL search query
     */
    get query() { return this._query }

    /**
     * Internal variables
     */
    get variables() { return this._variables }
    
    /**
     * Cookies sent by the client in as JS object
     */
    get cookies() {
        const cookieHeader = this.headers.get("Cookie");

        return parseCookies(cookieHeader ?? "");
    }

    /**
     * Internal variables as JS object
     * @readonly
     */
    get variablesObject() {
        return Object.fromEntries(this._variables.entries());
    }

    /**
     * Request headers as JS object
     * @readonly
     */
    get headersObject() {
        return Object.fromEntries(this._headers.entries());
    }

    /**
     * The URL parameters if declared in route path as JS object
     * @readonly
     */
    get paramsObject() {
        return Object.fromEntries(this._params.entries());
    }

    /**
     * The URL search query as JS object
     * @readonly
     */
    get queryObject() {
        return Object.fromEntries(this._query.entries());
    }


    /**
     * Get the assertions on the request
     * @readonly
     */
    get assertions() {
        return this._assertions;
    }


    assert(cond: boolean | Promise<boolean> | ((req?: Denoot.Request, res?: Denoot.Response) => boolean | Promise<boolean>)) {
        class Assertion {
            constructor(private _cond: typeof cond, private req: Denoot.Request, private res: Denoot.Response) {
                req._assertions.push(this.resolve());
            }

            /**
             * Define what happens if assertion condition is satisfied
             * @param callback The callback to be called if assertion condition is accepted
             */
            accept(callback: (req: Denoot.Request, res: Denoot.Response) => unknown) {
                this.resolve().then(accepted => {
                    if (accepted) {
                        callback(this.req, this.res);
                    }
                });

                return this;
            }

            /**
             * Define what to do on rejection
             * @param callback Will be called if condition is rejected
             */
            reject(callback: (req: Denoot.Request, res: Denoot.Response) => unknown) {
                this.resolve().then(accepted => {
                    if (!accepted) {
                        callback(this.req, this.res);
                    }
                })

                return this;
            }

            /**
             * Will always be called regardless if assertion is true or false
             * @param callback The callback to always be called after an assertion
             */
            always(callback: (req: Denoot.Request, res: Denoot.Response) => unknown) {
                this.resolve().then(() => {
                    callback(this.req, this.res);
                })
            }

            /**
             * Get the condition you previously provided
             */
            get cond() { return this._cond }

            /**
             * Tap into the assertion process and define custom logic without reject or accept methods
             */
            public async resolve(): Promise<boolean> {
                if (typeof this._cond === "boolean") {
                    return !!this._cond;
                } else if (this._cond instanceof Promise) {
                    return !!(await this._cond);
                } else if (typeof this._cond === "function") {
                    return !!(await this._cond)(this.req, this.res);
                }
                return false;
            }
        }

        return new Assertion(cond, this, this._res);
        

    }

}

export default DenootRequest;

