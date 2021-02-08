import { Cors, Next, Request, Response } from "../../types/definitions.d.ts";

interface CorsOptions {
    continue?: boolean,
    referer?: boolean,
    varyOrigin?: boolean,
    memoize?: boolean,
    allMethods?: boolean
}

const defaultCorsOptions: CorsOptions = {
    continue: false,
    referer: false,
    varyOrigin: true,
    memoize: true,
    allMethods: false
}

function setCorsHeader(res: Response, options: CorsOptions) {
    res.headers.set("Access-Control-Allow-Origin", "*");

    if(options.varyOrigin) {
        res.headers.set("Vary", "Origin");
    }
}

export default (cors: Cors, _options: CorsOptions = defaultCorsOptions) => {
    const options = { ...defaultCorsOptions, ..._options };

    const memoize = new Map<string, boolean>();

    return async (req: Request, res: Response, next: Next) => {
        if (req.method === "OPTIONS" || options.allMethods) {
            console.log(memoize);

            const origin = req.headers.get(options.referer ? "Referer" : "Origin");

            if (origin === null) {
                // Not a cors call
                return next();
            }


            // Get memoized value if memoize is enabled
            if (options.memoize && memoize.has(origin)) {
                if (memoize.get(origin)) {
                    setCorsHeader(res,options);
                }
                res.setEmpty().end();
                return next();
            }


            // Check if origin is allowed
            const allowedOrigin = [
                Array.isArray(cors) && cors.includes(origin),
                typeof cors === 'function' && await cors(req, res, origin),
                typeof cors === 'string' && cors === origin
            ].includes(true)



            if (allowedOrigin) {
                setCorsHeader(res, options);
            }



            // Add result in Map if memoize is enabled
            if(options.memoize) {
                memoize.set(origin, allowedOrigin);
            }



            if (!options.continue) {
                res.setEmpty().end();
            }
        }

        next();
    }
}