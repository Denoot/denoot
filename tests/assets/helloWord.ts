import { Request, Response } from "../../mod.ts";

export default (req: Request, res: Response) => {
    res.send("Hello World!");
}