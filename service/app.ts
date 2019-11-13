import * as express from "express";
import { ControllerLoader } from "../lib/Contoller";
import * as Path from "path";
import { RequestHandler } from "express-serve-static-core";

@ControllerLoader({
  filePath: Path.join(__dirname, "./controllers")
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

  public use(...args: Array<RequestHandler | express.ErrorRequestHandler>) {
    this._express.use(...args);
  }
}

const app = new App();

app.routes.forEach(router => {
  app.use(router);
});

export default app.express;
