import * as express from "express";
import { ControllerLoader, ExpressApp } from "../lib/Controller";
import * as Path from "path";

@ControllerLoader({
  filePath: Path.join(__dirname, "./controllers"),
  validator: true,
  autoInjectRoutes: true
})
class App extends ExpressApp {
  beforeRouterInjectMiddlewares = [
    (req: any, res: any, next: any) => {
      console.log("in before router middleware");
      return next();
    },
    {
      active: () => process.env.NODE_ENV === "DEVELOPMENT",
      middleware: (req: any, res: any, next: any) => {
        console.log("---- development -----");
        return next();
      }
    }
  ];

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
