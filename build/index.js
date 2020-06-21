"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressApp = exports.Validator = exports.Delete = exports.Post = exports.Put = exports.Get = exports.Middlewares = exports.ControllerLoader = exports.Controller = void 0;
const Ctrl = require("./Controller");
const Vali = require("./Validator");
exports.Controller = Ctrl.Controller;
exports.ControllerLoader = Ctrl.ControllerLoader;
exports.Middlewares = Ctrl.Middlewares;
exports.Get = Ctrl.Get;
exports.Put = Ctrl.Put;
exports.Post = Ctrl.Post;
exports.Delete = Ctrl.Delete;
exports.Validator = Vali.Validator;
exports.ExpressApp = Ctrl.ExpressApp;
//# sourceMappingURL=index.js.map