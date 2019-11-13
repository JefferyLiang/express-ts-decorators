"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const RouterService_1 = require("./RouterService");
const express_1 = require("express");
const fs = require("fs");
function Controller(path) {
    return target => {
        Reflect.defineMetadata(RouterService_1.RouterService.PREFIX_METADATA, path, target);
    };
}
exports.Controller = Controller;
exports.Get = RouterService_1.RouterService.createMappingDecorator("GET");
exports.Post = RouterService_1.RouterService.createMappingDecorator("POST");
exports.Delete = RouterService_1.RouterService.createMappingDecorator("DELETE");
exports.Put = RouterService_1.RouterService.createMappingDecorator("PUT");
function ControllerLoader(option) {
    return function (constr) {
        return class extends constr {
            constructor(...args) {
                super(...args);
                this.routes = [];
                if (option.filePath) {
                    if (!fs.existsSync(option.filePath)) {
                        throw new Error(`controllers path for ${option.filePath} not exist`);
                    }
                    let controllers = ControllerLoaderService.getControllersWithFilePath(option.filePath);
                    this.routes = ControllerLoaderService.getRoutes(controllers);
                }
            }
        };
    };
}
exports.ControllerLoader = ControllerLoader;
class ControllerLoaderService {
    static getControllersWithFilePath(path) {
        let contorllerList = [];
        const files = fs
            .readdirSync(path)
            .filter((val) => val.endsWith(".ts") || val.endsWith(".js"));
        for (let file of files) {
            const controllerModule = require(`${path}/${file}`);
            for (let key in controllerModule) {
                const MODULE = controllerModule[key];
                if (MODULE instanceof Function &&
                    Reflect.getMetadata(RouterService_1.RouterService.PREFIX_METADATA, MODULE)) {
                    contorllerList.push(MODULE);
                }
            }
        }
        return contorllerList;
    }
    static routerBuilder(config) {
        let router = express_1.Router();
        config
            .filter(val => val !== undefined)
            .forEach(val => {
            const path = val.prefix + val.route;
            router[val.method.toLocaleLowerCase()](path, val.fn);
        });
        return router;
    }
    static getRoutes(controllers) {
        let routes = [];
        for (let _controller of controllers) {
            let controller = new _controller();
            const prototype = Object.getPrototypeOf(controller);
            let methods = Object.getOwnPropertyNames(prototype).filter(val => val !== "constructor");
            let routesConfig = methods.map(val => {
                let fn = prototype[val];
                const prefix = Reflect.getMetadata(RouterService_1.RouterService.PREFIX_METADATA, _controller);
                const route = Reflect.getMetadata(RouterService_1.RouterService.PATH_METADAT, fn);
                const method = Reflect.getMetadata(RouterService_1.RouterService.METHOD_METADATA, fn);
                if (!method ||
                    this.CTRL_METHOD_LIST.indexOf(method.toUpperCase()) === -1) {
                    return undefined;
                }
                return {
                    prefix,
                    route,
                    method,
                    fn
                };
            });
            if (routesConfig.length > 0) {
                routes.push(this.routerBuilder(routesConfig));
            }
        }
        return routes;
    }
}
exports.ControllerLoaderService = ControllerLoaderService;
ControllerLoaderService.CTRL_METHOD_LIST = ["GET", "PUT", "POST", "DELETE"];
//# sourceMappingURL=Contoller.js.map