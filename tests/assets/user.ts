import { Request, Response } from "../../mod.ts";


export const login = (req: Request, res: Response) => {
    res.send("Welcome back!");
}
export const logout = (req: Request, res: Response) => {
    res.send("Bye!");
}