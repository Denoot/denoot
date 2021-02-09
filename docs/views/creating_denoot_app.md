# Creating a Denoot App
To create a Denoot app you must at least provide `port`. `host` is optional and will default to "127.0.0.1". `callback` is optional and will return an Object of the listening state.
## Examples — Pick Your Poison
### All Info
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000, "0.0.0.0", console.table);
```
### Regular
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000, "localhost", ({ localhostURL }) => console.log(`Listening on ${localhostURL}.`));
```
### Minimalistic
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

const app = Denoot.app(3000);
```