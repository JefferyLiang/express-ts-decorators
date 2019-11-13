# express-ts-descorator

> The Express typescript easy to use decorator project

## Usage

1. Set up your Controller

```typescript
// ./controllers/hello.ts
import { Controller, Get } from "express-ts-descorator";

@Controller("/api/hello")
export class Hello {
  @Get("")
  public hello() {
    return "hello";
  }

  @Get("/json")
  public jsonHello() {
    return {
      message: "hello"
    };
  }
}
```

2. Set up your App

```typescript
// app.ts
import * as express from "express";
import { ControllerLoader } from "express-ts-descroator";
import * as Path from "path";

@ControllerLoader({
  filePath: Path.join(__dirname, "./controllers") // path to your controllers file
})
class App {
  private _express: express.Express;
  public routes: express.Router[] = [];

  get express() {
    return this._express;
  }

  constructor() {
    this._express = express();
  }

  public use(
    ...args: Array<express.RequestHandler | express.ErrorRequestHandler>
  ) {
    this._express.use(...args);
  }
}

const app = new App();

// inject the loader routes config
app.routes.forEach(router => {
  app.use(router);
});

app.express.listen(3000);
```

3. Run!

```bash
  ~ ts-node app.ts
```

## Test

```bash
  ~ yarn test
```
