import "reflect-metadata";
import { RouterService } from "./RouterService";
import { Router, RequestHandler, Express, ErrorRequestHandler } from "express";
import * as fs from "fs";

// 控制器装饰器
export function Controller(path: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata(RouterService.PREFIX_METADATA, path, target);
  };
}

// 中间件装饰器
export function Middlewares(...middlewares: RequestHandler[]): MethodDecorator {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(
      `${ControllerLoaderService.MIDDLEWARES_KEY.toString()}_${key.toString()}`,
      middlewares,
      target
    );
  };
}

// HTTP方法装饰器
export const Get = RouterService.createMappingDecorator("GET");
export const Post = RouterService.createMappingDecorator("POST");
export const Delete = RouterService.createMappingDecorator("DELETE");
export const Put = RouterService.createMappingDecorator("PUT");

type RouterConfigOption = {
  prefix: string;
  route: string;
  method: string;
  fn: Function;
};

type ControllerLoaderOption = {
  debug?: boolean;
  filePath: string;
  validator?: boolean;
  autoInjectRoutes?: boolean;
};

// 服务器注入装饰器
export function ControllerLoader(option: ControllerLoaderOption) {
  return function <ExpressApp extends { new (...args: any[]): {} }>(
    constr: ExpressApp
  ) {
    return class extends constr {
      public routes: Router[];

      constructor(...args: any[]) {
        super(...args);
        // 注入路由
        this.routes = [];
        ControllerLoaderService.debug = option.debug || false;
        if (option.filePath) {
          if (!fs.existsSync(option.filePath)) {
            throw new Error(
              `controllers path for ${option.filePath} not exist`
            );
          }
          // 获取控制器
          let controllers = ControllerLoaderService.getControllersWithFilePath(
            option.filePath
          );
          // 获取每个控制器对应的路由
          this.routes = ControllerLoaderService.getRoutes(controllers);

          // 自动注入到路由之中
          if (option.autoInjectRoutes) {
            let app: any = null;
            let beforeRouterMiddlewares: any = [];
            for (let key in this) {
              if (key === "_express") {
                app = this[key];
              }
              if (key === "beforeRouterInjectMiddlewares") {
                beforeRouterMiddlewares = this[key];
              }
            }
            if (beforeRouterMiddlewares) {
              ControllerLoaderService.injectMiddlewaresBeforeRouterInject(
                app,
                beforeRouterMiddlewares
              );
            }
            if (app) {
              ControllerLoaderService.injectRouter(app, this.routes);
            }
          }
        }
      }
    };
  };
}

// 控制器注入服务类
export class ControllerLoaderService {
  public static debug: boolean = false;
  // 允许注入的路由类型
  private static CTRL_METHOD_LIST = ["GET", "PUT", "POST", "DELETE"];
  public static MIDDLEWARES_KEY = Symbol("MIDDLEWARES_KEY");

  public static log(msg: string) {
    if (this.debug) {
      console.log(
        `[Express-ts-decorator] ${new Date().toLocaleString()} : ${msg}`
      );
    }
  }

  // 根据文件夹路径获取控制器
  public static getControllersWithFilePath(path: string) {
    this.log("Find controller now...");
    let contorllerList: any[] = [];
    const files = fs
      .readdirSync(path)
      .filter((val: string) => val.endsWith(".ts") || val.endsWith(".js"));
    for (let file of files) {
      const controllerModule = require(`${path}/${file}`);
      for (let key in controllerModule) {
        const MODULE = controllerModule[key];
        if (
          MODULE instanceof Function &&
          Reflect.getMetadata(RouterService.PREFIX_METADATA, MODULE)
        ) {
          contorllerList.push(MODULE);
        }
      }
    }
    return contorllerList;
  }

  private static routerBuilder(
    config: Array<RouterConfigOption | undefined>,
    controller?: any
  ): Router {
    this.log("Buildding router ...");
    let router: any = Router();
    config
      .filter(val => val !== undefined)
      .forEach(val => {
        const path = val!.prefix + val!.route;
        router[val!.method.toLocaleLowerCase()](path, val!.fn.bind(controller));
      });
    return router;
  }

  public static getRoutes(controllers: any[]): Array<Router> {
    let routes: Router[] = [];
    this.log("Mapping Controller ...");
    for (let _controller of controllers) {
      let controller = new _controller();
      // 获取参数
      const prototype: any = Object.getPrototypeOf(controller);
      // 获取方法
      let methods: string[] = Object.getOwnPropertyNames(prototype).filter(
        val => val !== "constructor"
      );
      let routesConfig: Array<RouterConfigOption | undefined> = methods.map(
        val => {
          // 获取方法
          let fn: any = prototype[val];
          // 获取其他控制器信息
          const prefix = Reflect.getMetadata(
            RouterService.PREFIX_METADATA,
            _controller
          );
          const route = Reflect.getMetadata(RouterService.PATH_METADAT, fn);
          const method: string = Reflect.getMetadata(
            RouterService.METHOD_METADATA,
            fn
          );
          if (
            !method ||
            this.CTRL_METHOD_LIST.indexOf(method.toUpperCase()) === -1
          ) {
            return undefined;
          }

          return {
            prefix,
            route,
            method,
            fn
          };
        }
      );

      if (routesConfig.length > 0) {
        routes.push(this.routerBuilder(routesConfig, controller));
      }
    }
    // 返回路由配置
    return routes;
  }

  public static injectRouter(express: Express, routes: Router[]) {
    this.log("Begin to auto inject controller router");
    for (let router of routes) {
      express.use(router);
    }
  }

  public static injectMiddlewaresBeforeRouterInject(
    express: Express,
    middlewares: Array<RequestHandler | BeforeRouterInjectMiddleware>
  ) {
    this.log("Inject before router middlewares");
    for (let item of middlewares) {
      if (item instanceof Function) {
        express.use(item);
      } else if (item instanceof Object) {
        let KEYS = Object.keys(item);
        if (
          KEYS.find(val => val === "active") &&
          KEYS.find(val => val === "middleware")
        ) {
          let isActive =
            item.active instanceof Function ? item.active() : item.active;
          if (isActive) {
            express.use(item.middleware);
          }
        }
      }
    }
  }
}

type BeforeRouterInjectMiddleware = {
  active: Boolean | Function;
  middleware: RequestHandler;
};

// 控制器注入描述类
export class ExpressApp {
  private _express: Express;
  public routes: Router[] = [];
  public beforeRouterInjectMiddlewares: Array<
    RequestHandler | BeforeRouterInjectMiddleware
  > = [];

  get express() {
    return this._express;
  }

  constructor(app: Express) {
    this._express = app;
  }

  public use(...args: Array<RequestHandler | ErrorRequestHandler>) {
    this._express.use(...args);
  }
}
