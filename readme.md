
<div align="center">
    <h1>
        Denoot — Web Server
    </h1>
    <img src="https://i.imgur.com/20W1wHg.png" alt="Denoot logo" style="width:200px;" width="200" />
    <p><a href="https://denoot.dev">Denoot</a> is a light weight, high performance, express.js style web server/router for <a href="https://deno.land">Deno</a></p>
</div>

***

## Getting Started


Create `server.ts`
```ts
import Denoot, { Request, Response } from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
```
Then start the server:
```sh
deno run --allow-net --unstable server.ts
```
After starting the server open [localhost:3000](http://localhost:3000)  

## [Documentation](https://denoot.dev/creating-denoot-app)
View the full documentation [here](https://denoot.dev/creating-denoot-app).