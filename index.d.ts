import Joi = require("@hapi/joi");
import { RequestHandler, Express, Router, ErrorRequestHandler } from "express";

type ControllerLoaderOption = {
  filePath: string;
  debug?: boolean;
  autoInjectRoutes?: boolean;
};

type ValidatorOption = {
  query?: Joi.Schema;
  body?: Joi.Schema;
  params?: Joi.Schema;
};

declare class ExpressAppItf {
  _express: Express;
  routes: Router[];
  constructor(app: Express);
  express(): Express;
  use(...args: Array<RequestHandler | ErrorRequestHandler>): void;
}

declare namespace expressTsDecorator {
  export class ExpressAppItf {}
  export function Controller(path: string): ClassDecorator;
  export function ControllerLoader(option: ControllerLoaderOption);
  export function Get(path: string): MethodDecorator;
  export function Put(path: string): MethodDecorator;
  export function Delete(path: string): MethodDecorator;
  export function Post(path: string): MethodDecorator;
  export function Validator(option: ValidatorOption): MethodDecorator;
  export function Middlewares(...middlewares: RequestHandler[]);
}

export = expressTsDecorator;
