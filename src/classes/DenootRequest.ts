import { ServerRequest } from "https://deno.land/std@0.85.0/http/server.ts";
import { AllMethods, RenderEngineCallback } from "../../types/definitions.d.ts";
import { State } from "../../mod.ts";
import { parseCookies } from "../cookieParser/cookieParser.ts";
import { decode } from "https://deno.land/std@0.85.0/encoding/utf8.ts";


/**
 * The HTTP request as abstracted by Denoot
 * @class DenootRequest 
 */
class DenootRequest {

    private _url: string = "";
    private _method: AllMethods;
    private _params: Map<string, string> = new Map();
    private _query: Map<string, string> = new Map();
    private _variables: Map<string, any> = new Map();
    private _headers: Headers;

    
    /**
     * @internal
     */
    constructor(public readonly state: State, public readonly denoReq: ServerRequest) {
        
        this._url = denoReq.url;
        this._method = denoReq.method as AllMethods;
        this._headers = denoReq.headers;
        
        for (const [ key, value ] of new URLSearchParams(denoReq.url.split("?")?.[1])) {
            this.query.set(key, value);
        }

    }


    get body(): Promise<string | object | any[]> {
        return (async () => {
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

}

export default DenootRequest;