"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorService = exports.Validator = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
function Validator(option) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(`${ValidatorService.VALIDATOR_KEY.toString()}_${key.toString()}`, option, target);
    };
}
exports.Validator = Validator;
class ValidatorService {
    static getMetadataKey(key) {
        return `${this.VALIDATOR_KEY.toString()}_${key.toString()}`;
    }
    static validate(validator, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (validator.query) {
                    yield validator.query.validateAsync(data.query);
                }
                if (validator.body) {
                    yield validator.body.validateAsync(data.body);
                }
                if (validator.params) {
                    yield validator.params.validateAsync(data.params);
                }
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.ValidatorService = ValidatorService;
ValidatorService.VALIDATOR_KEY = Symbol("VALIDATOR_KEY");
//# sourceMappingURL=Validator.js.map