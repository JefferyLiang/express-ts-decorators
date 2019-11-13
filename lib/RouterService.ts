import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import * as _ from "lodash";
import { ValidatorService, ValidatorOption } from "./Validator";
// 路由注解生成服务器类
// router annonations builder service
export class RouterService {
  public static PREFIX_METADATA = Symbol("PREFIX");
  public static PATH_METADAT = Symbol("PATH");
  public static METHOD_METADATA = Symbol("METHOD");

  public static createMappingDecorator(method: string) {
    return (path: string): MethodDecorator => {
      return (target, key, descriptor: PropertyDescriptor) => {
        let original = descriptor.value;
        // 重新Hook服务函数
        descriptor.value = async function(...args: any[]) {
          let req: Request = args[0];
          let res: Response = args[1];
          let next: NextFunction = args[2];
          try {
            // 校验
            let validator: ValidatorOption = Reflect.getMetadata(
              ValidatorService.getMetadataKey(key.toString()),
              target
            );
            if (validator) {
              await ValidatorService.validate(validator, req);
            }
            // 校验结束
            let result = await original.apply(this, [req, res, next]);
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
          } catch (err) {
            return next(err);
          }
        };
        // 挂载元数据
        Reflect.defineMetadata(this.PATH_METADAT, path, descriptor.value);
        Reflect.defineMetadata(this.METHOD_METADATA, method, descriptor.value);
      };
    };
  }
}
