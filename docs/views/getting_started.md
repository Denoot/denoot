# Getting Started
server.ts
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);

app.get("/", (req: Denoot.Request, res: Denoot.Response) => {
    res.send("Hello World!");
});
```
Then start the server:
```sh
deno run --allow-net --unstable server.ts
```
After starting open [localhost:3000](http://localhost:3000) 