import "reflect-metadata";
import { RouterService } from "./RouterService";
import { Router, RequestHandler } from "express";
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
  filePath: string;
  validator?: boolean;
};

// 服务器注入装饰器
export function ControllerLoader(option: ControllerLoaderOption) {
  return function<T extends { new (...args: any[]): {} }>(constr: T) {
    return class extends constr {
      public routes: Router[];

      constructor(...args: any[]) {
        super(...args);
        // 注入路由
        this.routes = [];
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
        }
      }
    };
  };
}

// 控制器注入服务类
export class ControllerLoaderService {
  // 允许注入的路由类型
  private static CTRL_METHOD_LIST = ["GET", "PUT", "POST", "DELETE"];
  public static MIDDLEWARES_KEY = Symbol("MIDDLEWARES_KEY");

  // 根据文件夹路径获取控制器
  public static getControllersWithFilePath(path: string) {
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
    config: Array<RouterConfigOption | undefined>
  ): Router {
    let router: any = Router();
    config
      .filter(val => val !== undefined)
      .forEach(val => {
        const path = val!.prefix + val!.route;
        router[val!.method.toLocaleLowerCase()](path, val!.fn);
      });
    return router;
  }

  public static getRoutes(controllers: any[]): Array<Router> {
    let routes: Router[] = [];
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
        routes.push(this.routerBuilder(routesConfig));
      }
    }
    // 返回路由配置
    return routes;
  }
}
