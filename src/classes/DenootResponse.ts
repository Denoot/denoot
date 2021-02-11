import { State, Request } from "../../mod.ts";
import { ServerRequest } from "https://deno.land/std@0.85.0/http/server.ts";
import { extname } from "https://deno.land/std@0.85.0/path/mod.ts";
import { e404, e403 } from "../middleware/errors.ts";
import * as denoPath from "https://deno.land/std@0.85.0/path/mod.ts";
import MEDIA_TYPES from "../constants/mediaTypes.ts";
import { serializeCookies, SerializeOptions } from "../cookieParser/cookieParser.ts";


/**
 * The HTTP response as abstracted by Denoot
 * @class DenootResponse
 */
export default class DenootResponse {

    private _body: string[] = [""];
    private _ended: boolean = false;
    private _isJSON: boolean = false;
    private _headers: Headers = new Headers();
    private _buffer?: Deno.File | Uint8Array;
    public _req!: Request;
    private _status: number = 200;
    private _empty: boolean = false;

    /**
     * @internal
     */
    constructor(private readonly state: State, public readonly denoReq: ServerRequest) {
        this.headers.set("X-Powered-By", "Deno/Denoot");
        this.headers.set("Connection", "Keep-Alive");
    }

    /** 
     * End the request and give current body
     */
    end() {
        this._ended = true;

        return this;
    }

    private addBodyPart = (part: string) => {
        if (!this._ended)
            this._body.push(part);
    }

    /**
     * Override previous body. Uses res.send() internally
     * @param value The new body to override previous body
     */
    setBody(value: string | object | Array<any> | Uint8Array) {
        this._body = [""];

        return this.send(value);
    }


    /**
     * This method is appending meaning if you call it multiple times (works cross route) it will append to the existing response body (only for json or string, Uint8Array is not appended)
     * @param value The response to be sent to the client
     */
    send(value: string | object | Array<any> | Uint8Array) {
        if (value instanceof Uint8Array) {
            this.headers.set("Content-Type", "application/octet-stream");
            this._buffer = value;
        } else if (typeof value === "string") {
            this.headers.set("Content-Type", "text/plain");
            this.addBodyPart(value);
        }
        else {
            this.addBodyPart(JSON.stringify(value));
            if (this._body.length === 1) {
                this.headers.set("Content-Type", "application/json");
                this._isJSON = true;
            } else {
                this._isJSON = false;
                this.headers.set("Content-Type", "text/plain");
            }
        }

        return this;
    }


    /**
     * Makes the response empty. Stack.ts Controlls the resonponse after that
     */
    setEmpty(empty: boolean = true) {
        this._empty = empty;
        return this;
    }

    /**
     * Send the response as HTML
     * @param value HTML as string
     */
    html(value: string) {
        this.headers.set("Content-Type", "text/html");
        this.addBodyPart(value);
        return this;
    }


    /**
     * Set a cookie value with optional options
     * @param key The cookie name
     * @param value The cookie value
     * @param options optional options
     */
    setCookie(key: string, value: string, options?: SerializeOptions) {
        const newCookieString = serializeCookies(key, value, options ?? {});

        this.headers.set("Set-Cookie", newCookieString);

        return this;
    }


    /**
     * Request has ended?
     */
    get ended() { return this._ended; }

    /**
     * Returns true if response type is JSON
     */
    get isJson() { return this._isJSON; }

    /**
     * Response buffer
     */
    get buffer() { return this._buffer; }


    /**
     * The current response status
     */
    get getStatus() { return this._status }

    /**
     * The current response body as a string
     */
    get body() {
        return this._body.join("");
    }

    /**
     * If the current response is empty
     */
    get empty() {
        return this._empty;
    }

    /**
     * Headers as map
     */
    get headers() {
        return this._headers;
    }

    /**
     * An Object representing the headers (readonly)
     */
    get headersObject() {
        return Object.fromEntries(this._headers.entries());
    }


    /**
     * Sets the response status code.
     * @param status status code
     */
    status(status: number) {
        this._status = status;

        return this;
    }


    /**
     * Set response header and return this. Useful when method chaining.
     * @param headerName The name of the header
     * @param headerValue The value of the header
     */
    setHeader(headerName: string, headerValue: string) {
        this.headers.set(headerName, headerValue);
        return this;
    }

    /**
     * Ends the request. Sets status to 404. Shows 404 html
     */
    setError404() {
        return this
            .status(404)
            .setBody(e404(this._req))
            .html("");
    }

    /**
     * Ends the request. Sets status to 403. Shows 403 html
     */
    setError403() {
        this.status(403);
        this.setBody(e404(this._req));
        return this;
    }

    /**
     * Render a view and add it to the response body
     * @param filePath path relative to views folder of the template to be rendered
     * @param options the options to be passed into the rendering engine
     */
    async render(filePath: string, options: any) {
        const rendered = await this.state.renderer?.(filePath, options) ?? "Error: No render engine set";

        this.addBodyPart(rendered);

        return this;

    }

    /**
     * Send a file as a response. Implicitly ends request. Throws 404 if file does not exist.
     * NOTE: In Deno, unlike Node, cwd is relative to the directory from which deno was run.
     * @param path absolute or relative path to file
     */
    async sendFile(path: string) {

        if (this.body) {
            throw new Error("Cannot send file after body is set");
        }
        // Head methods should not responde with body
        else if (this.denoReq.method === "HEAD") {
            return this.end();
        }

        const handleError = (log: boolean) => (e: Error) => {

            const permissionDenied = e.toString().includes("PermissionDenied");

            if (permissionDenied && log) {
                console.error("Denoot: PermissionDenied error received. Did you forget to run with --allow-read flag?");
            }

            this.setError404();
        }

        const [file, fileInfo] = await Promise.all([
            Deno.open(path, {
                read: true
            }).catch(handleError(false)),
            Deno.stat(path).catch(handleError(true)),
        ]);


        if (!file || !fileInfo) return this;

        const range = this.denoReq.headers.get("range");

        const basename = denoPath.basename(path);

        // prevent serving dotfile
        if (basename.startsWith(".") && !this.state.allowDotFiles) {
            return this.setError403().end();
        }

        // partial content?
        if (!range) {
            // this.headers.set("Content-Length", fileInfo.size.toString());
            this._buffer = file
        }
        else {
            /* eval seek */
            const seek = parseInt((range?.split("=")?.[1].match(/[0-9]+/)?.[0]) ?? "0") || 0;

            /* seek to client specified range */
            try {
                await file.seek(seek, Deno.SeekMode.Start);
            } catch (e) {
                return this.setError404().end();
            }

            this._buffer = file;

            this.headers.set("Content-Range", `bytes ${seek}-${fileInfo.size - 1}/${fileInfo.size}`);
            this.headers.set("Transfer-Encoding", "chunked");
            this.status(206);

        }

        this.headers.set("Content-Type", contentType(path));
        this.headers.set("Accept-Ranges", "bytes");
        //this.headers.set("Transfer-Encoding", "chunked");

        this.denoReq.done.then(d => {
            file.close();
            return Promise.resolve(d);
        });

        this.end();

        return this;

    }

    /**
     * Redirect to given url. If host is not specified it will redirect with current host.
     * 
     * Sets "Location" header
     * @param {location} - The location to redirect to
     */
    redirect(location: string, permanent: (boolean | 301 | 302 | 308) = 302) {

        return this
            .setHeader("Location", location)
            .status((typeof permanent === "boolean") ? permanent ? 301 : 302 : permanent)
            .end();

    }

}

/**
 * Get correct MIME type of file - defaults to text/plain if not found
 * 
 * Looks at the extension
 * @param path The path to the file
 */
function contentType(path: string): string {
    return MEDIA_TYPES[extname(path)] ?? "text/plain";
}