# Getting Started
Create `server.ts`
```ts
import Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);

app.get("/", (req, res) => {
    res.send("Hello World!");
});
```
Then start the server:
```sh
deno run --allow-net --unstable server.ts
```
After starting open [localhost:3000](http://localhost:3000)