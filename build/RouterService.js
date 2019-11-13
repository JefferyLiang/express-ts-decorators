"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const _ = require("lodash");
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
                            let result = yield original.apply(this, [req, res, next]);
                            switch (true) {
                                case _.isString(result):
                                    res.end(result);
                                    break;
                                case _.isObject(result):
                                    res.json(result);
                                    break;
                                default:
                                    res.end(result);
                            }
                        }
                        catch (err) {
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