# Render Templates

You can use Denoot to render templates on the fly. You have to provide the rendering engine for Denoot to use.
## Handlebars Example
Simple handlebars for Deno example.
```ts
import Denoot, { Request, Response } from "https://deno.land/x/denoot/mod.ts";
import { Handlebars } from "https://deno.land/x/handlebars/mod.ts";

const app = Denoot.app(3000, "0.0.0.0", ({ localhostURL }) => console.log(`Listening on ${localhostURL}`));
const handle = new Handlebars();

app.render(handle.renderView.bind(handle));

app.get("/user/{username}", async (req: Request, res: Response) => {
    // assumes ./views/user.hbs and ./views/layouts.main.hbs exists. See https://deno.land/x/handlebars
    await res.render("user", {
        firstname: req.params.get("username").parsed,
        lastname: "Doe"
    });
});
```
See [handlebars for Deno documentation](https://deno.land/x/handlebars) and [handlebars.js guide](https://handlebarsjs.com/guide/) for more information.


## Custom Rendering Engine
Denoot supports rendering templates by declaring a template rendering callback.
```ts
const renderer: Denoot.RenderEngineCallback;
app.render(renderer);
```
You can easily use any template engine you want by satisfying the following callback type.
```ts
type RenderEngineCallback =
    (filePath: string, options: any) =>
        string | Promise<string>;
```
After you've declared your rendering engine callback you gain access to `res.render`. This is merely an abstraction for calling the defined rendering engine callback.
```ts
app.get("/home", async (req: Request, res: Response) => {
    await res.render("home-page", {
        user: {
            name: "John Doe"
        }
    });
});
```