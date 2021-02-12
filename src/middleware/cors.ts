
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
    allMethods: true
}

function setCorsHeader(res: Denoot.Response, options: CorsOptions) {
    res.headers.set("Access-Control-Allow-Origin", "*");

    if (options.varyOrigin) {
        res.headers.set("Vary", "Origin");
    }
}

export default (cors: Denoot.Cors = null, _options: CorsOptions = defaultCorsOptions) => {
    const options = { ...defaultCorsOptions, ..._options };

    const memoize = new Map<string, boolean>();

    return async (req: Denoot.Request, res: Denoot.Response, next: Denoot.Next) => {

        if (req.method === "OPTIONS" || options.allMethods) {

            const origin = req.headers.get(options.referer ? "Referer" : "Origin");


            
            if (origin === null) {
                // Not a cors call
                return next();
            }


            // Get memoized value if memoize is enabled
            if (options.memoize && memoize.has(origin)) {
                if (memoize.get(origin)) {
                    setCorsHeader(res, options);
                }
                res.setEmpty().end();
                return next();
            }


            const conditions = [
                cors === null,
                Array.isArray(cors) && cors.includes(origin),
                typeof cors === 'function' && await cors(req, res, origin),
                typeof cors === 'string' && cors === origin
            ];


            
            // Check if origin is allowed
            const allowedOrigin = conditions.includes(true)

            if (allowedOrigin) {
                setCorsHeader(res, options);
            }

            // Add result in Map if memoize is enabled
            if (options.memoize) {
                memoize.set(origin, allowedOrigin);
            }



            if (!options.continue) {
                res.setEmpty().end();
            }
        }

        next();
    }
}