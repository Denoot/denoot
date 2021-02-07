import { Next, Request, Response } from "../../types/definitions.d.ts";

export const e404 = (req: Request) => `<html>
    <head>
        <title>404</title>
    </head>
    <body>
        <center>
            <h1>404 Not Found</h1>
            <hr>
            <p>Denoot for Deno</p>
        </center>
    </body>
</html>`;

export const e403 = (req: Request) => `<html>
    <head>
        <title>403</title>
    </head>
    <body>
        <center>
            <h1>403 Permission Denied</h1>
            <hr>
            <p>Denoot for Deno</p>
        </center>
    </body>
</html>`;

export const middleWare404 = (_req: Request, res: Response, next: Next) => {

    res.setError404().end();

    next();

}