import * as denoot from "../mod.ts";
import { Handlebars, HandlebarsConfig } from "https://deno.land/x/handlebars/mod.ts";

const DEFAULT_HANDLEBARS_CONFIG: HandlebarsConfig = {
    baseDir: "views",
    extname: ".hbs",
    layoutsDir: "layouts/",
    partialsDir: "partials/",
    defaultLayout: "main",
    helpers: undefined,
    compilerOptions: undefined,
};

const handle = new Handlebars({
    ...DEFAULT_HANDLEBARS_CONFIG,
    baseDir: "tests/views"
});

const app = denoot.app(3000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`));

app.render(handle.renderView.bind(handle));

app.get("/user/{username}", async (req, res) => {
    await res.render("test", {
        firstname: req.params.get("username"),
        lastname: "YEAH!"
    });
});