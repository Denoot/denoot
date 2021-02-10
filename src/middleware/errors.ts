
export const e404 = (req: Denoot.Request) => `<html>
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

export const e403 = (req: Denoot.Request) => `<html>
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

export const middleWare404 = (_req: Denoot.Request, res: Denoot.Response, next: Denoot.Next) => {

    res.setError404().end();

    next();

}