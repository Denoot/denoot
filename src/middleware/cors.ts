import { Cors, Next, Request, Response } from "../../types/definitions.d.ts";

export default (cors: Cors) => {

    return async (req: Request, res: Response, next: Next) => {
        const origin = req.headers.get("Origin");

        if(origin === null) {
            // Not a cors call
            return next();
        }

        if(Array.isArray(cors)) {
            if(cors.includes(origin)) {
                res.headers.set("Access-Control-Allow-Origin", "*");
            }
            return next();
        }

        if(typeof cors === 'function') {
            if(await cors(req,res,origin)) {
                res.headers.set("Access-Control-Allow-Origin", "*");
            }
            return next();
        }
        
        if(typeof cors === 'string') {
            if(cors === origin) {
                res.headers.set("Access-Control-Allow-Origin", "*");
            }
            return next();
        }
        

        return next();
    }

}