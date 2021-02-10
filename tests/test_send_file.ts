import Denoot, { Request, Response } from "../mod.ts";

const app = Denoot.app(8000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`))


// --allow-read --allow-net
app.get("/file", async (req: Request, res: Response) => {

    return res.sendFile("src/classes/DenootResponse.ts");

});