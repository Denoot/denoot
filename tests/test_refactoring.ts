import Denoot, { Request, Response } from "../mod.ts";
import { login, logout } from "./assets/user.ts";



const app = Denoot.app(8000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`))


// --allow-net --allow-read --unstable

app.get("/hello-world", import("./assets/helloWord.ts"));


app.get("/user/login", login);
app.get("/user/logout", logout);

app.map("GET", "patch")("/put-test", async (req: Request, res: Response) => {

    console.log(await req.body);

    res.html("Sure dude");

});

app.any("/any-test", (req: Request, res: Response) => {

    console.log("yup", req.denoReq.contentLength);

    res.html("hi");

})