import * as Denoot from "../mod.ts";

const app = Denoot.app(8000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`))

app.use(Denoot.cors((req, res, origin) => {
    return false;
}));

app.get("/what", (req, res) => {
    res.send("woah");
});