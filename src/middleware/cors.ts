import { Cors, Next, Request, Response } from "../../types/definitions.d.ts";
import { map } from "../routing/routes.ts";

export default (cors: Cors) => {
    const memoize = new Map<string, boolean>();

    return async (req: Request, res: Response, next: Next) => {
        const origin = req.headers.get("Origin");

        if(origin === null) {
            // Not a cors call
            return next();
        }

        if(memoize.has(origin)) {
            if(memoize.get(origin)) {
                res.headers.set("Access-Control-Allow-Origin", "*");
            }
            return next();
        }
        
        const allowedOrigin = [
            Array.isArray(cors)        && cors.includes(origin),
            typeof cors === 'function' && await cors(req,res,origin),
            typeof cors === 'string'   && cors === origin
        ].includes(true)

        if(allowedOrigin) {
            res.headers.set("Access-Control-Allow-Origin", "*");
        }
        memoize.set(origin, allowedOrigin);

        return next();
    }

}