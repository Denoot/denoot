# Build in middleware
## Cors

If you want to enable cors you can use the build in middleware `cors`
```ts
import * as Denoot from "https://deno.land/x/denoot/mod.ts";

app.use(Denoot.cors([ "https://example.com", "https://sub.example.com" ])); // Whoo we have Cors
```
The first argument is the cors identifier. It can be of type `string`, `string[]`, `null` and `(req, res, origin) => Promise<boolean> | boolean`

You can add also add options, these are the default values

```ts
const options = {
    continue: false,    // If the route stack should continue after cors call
    referer: false,     // If you want to use Referer instead of Origin header
    varyOrigin: true,   // Adds the header "Vary: Origin"
    memoize: true,      // Memoizes cors value
    allMethods: false   // If false cors will only run on OPTIONS call
};

app.use(Denoot.cors("https://example.com",options));
```
### Example:
```ts
app.use(Denoot.cors((req, res, origin) => {

    if(origin.match(/^https?:\/\/localhost:8080\/?$/)) {
        return true;
    }

    return false;

}));
```

**Note:** Remember to turn off memoize and varyOrigin if the cors function isn't a pure function.