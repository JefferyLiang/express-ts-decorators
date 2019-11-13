import "reflect-metadata";
import * as Joi from "@hapi/joi";

export type ValidatorOption = {
  query?: Joi.Schema;
  body?: Joi.Schema;
  params?: Joi.Schema;
};

export function Validator(option: ValidatorOption): MethodDecorator {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(
      `${ValidatorService.VALIDATOR_KEY.toString()}_${key.toString()}`,
      option,
      target
    );
  };
}

export class ValidatorService {
  public static VALIDATOR_KEY = Symbol("VALIDATOR_KEY");

  public static getMetadataKey(key: string) {
    return `${this.VALIDATOR_KEY.toString()}_${key.toString()}`;
  }

  public static async validate(
    validator: ValidatorOption,
    data: any
  ): Promise<boolean> {
    try {
      if (validator.query) {
        await validator.query.validateAsync(data.query);
      }
      if (validator.body) {
        await validator.body.validateAsync(data.body);
      }
      if (validator.params) {
        await validator.params.validateAsync(data.params);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }
}
