import * as express from "express";
import { ControllerLoader, ExpressApp } from "../lib/Controller";
import * as Path from "path";

@ControllerLoader({
  filePath: Path.join(__dirname, "./controllers"),
  validator: true,
  autoInjectRoutes: true
})
class App extends ExpressApp {
  constructor(app: express.Express) {
    super(app);
  }
}

const app = new App(express());

app.use((err, req, res, next) => {
  res.json(err);
});

app.express.listen(3000);

export default app.express;
