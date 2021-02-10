import Denoot from "../mod.ts";

const app = Denoot.app(3000);

app.use(Denoot.cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});


