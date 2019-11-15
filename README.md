# express-ts-decorator

> The Express typescript easy to use decorator project

## Install

```bash
  # use npm
  ~ npm i express-ts-decorator
  # use yarn
  ~ yarn add express-ts-decorator
```

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

// use the middlewares like that
// app.use(bodyParser.json());

// inject the loader routes config
app.routes.forEach(router => {
  app.use(router);
});

// catch the error like that
// app.use((err: IError, req: express.Request, res: express.Response, next: express.NextFunction) => { // do sth here });

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

## Validator

you can use the Joi to validate your http request parameter

```typescript
// ./controllers/hello.ts
import { Controller, Get, Validator } from "express-ts-descorator";
import * as Joi from "@hapi/joi";

// support the `query`, `body`, `params` validator in http request.
@Validator({
  query: Joi.object()
    .keys({
      name: Joi.string().required() // will throw error when request.query.name not exist or not the string
    })
    .requried()
  // body: .....
  // params: .....
})
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

## Middlewares

```typescript
import { Controller, Get, Middlewares, Validator } from "express-ts-decorator";
import * as Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";

@Controller("/api/hello")
export class Hello {
  @Validator({
    query: Joi.object()
      .keys({
        name: Joi.string().required()
      })
      .required()
  })
  @Middlewares(function(req: Request, res: Response, next: NextFunction) {
    console.log("in");
    // You can do something in here before call the controller main function
    next();
  })
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
