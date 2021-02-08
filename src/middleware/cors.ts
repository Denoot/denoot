import { Cors, Next, Request, Response } from "../../types/definitions.d.ts";

export default (cors: Cors) => {

    return async (req: Request, res: Response, next: Next) => {
        const origin = req.headers.get("Origin");

        if(origin === null) {
            // Not a cors call
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

        return next();
    }

}