"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const _ = require("lodash");
const Validator_1 = require("./Validator");
const Controller_1 = require("./Controller");
const lodash_1 = require("lodash");
const stream_1 = require("stream");
class RouterService {
    static createMappingDecorator(method) {
        return (path) => {
            return (target, key, descriptor) => {
                let original = descriptor.value;
                descriptor.value = function (...args) {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let req = args[0];
                        let res = args[1];
                        let next = args[2];
                        try {
                            for (let key in req.query) {
                                let item = req.query[key];
                                if (lodash_1.isString(item) &&
                                    ((item.startsWith("{") && item.endsWith("}")) ||
                                        (item.startsWith("[") && item.endsWith("]")))) {
                                    req.query[key] = JSON.parse(item) || item;
                                }
                            }
                            let validator = Reflect.getMetadata(Validator_1.ValidatorService.getMetadataKey(key.toString()), target);
                            if (validator) {
                                yield Validator_1.ValidatorService.validate(validator, req);
                            }
                            let middlewares = Reflect.getMetadata(`${Controller_1.ControllerLoaderService.MIDDLEWARES_KEY.toString()}_${key.toString()}`, target);
                            if (middlewares && middlewares.length > 0) {
                                for (let middleware of middlewares) {
                                    yield middleware.apply(this, [req, res, next]);
                                }
                            }
                            let result = yield original.apply(this, [req, res, next]);
                            switch (true) {
                                case _.isString(result):
                                    res.end(result);
                                    break;
                                case result instanceof stream_1.Stream:
                                    result.pipe(res);
                                    break;
                                case _.isObject(result):
                                    res.json(result);
                                    break;
                                default:
                                    res.end(result);
                            }
                        }
                        catch (err) {
                            console.error(err);
                            return next(err);
                        }
                    });
                };
                Reflect.defineMetadata(this.PATH_METADAT, path, descriptor.value);
                Reflect.defineMetadata(this.METHOD_METADATA, method, descriptor.value);
            };
        };
    }
}
exports.RouterService = RouterService;
RouterService.PREFIX_METADATA = Symbol("PREFIX");
RouterService.PATH_METADAT = Symbol("PATH");
RouterService.METHOD_METADATA = Symbol("METHOD");
//# sourceMappingURL=RouterService.js.map