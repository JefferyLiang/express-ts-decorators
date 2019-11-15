import { Controller, Get, Middlewares } from "../../lib/Contoller";
import { Validator } from "../../lib/Validator";
import * as Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";

@Controller("/api/hello")
export class Hello {
  @Validator({
    query: Joi.object()
      .keys({
        name: Joi.string().required()
      })
      .required()
  })
  @Middlewares(function(req: Request, res: Response, next: NextFunction) {
    console.log("in");
    next();
  })
  @Get("")
  public hello() {
    return "hello";
  }

  @Get("/json")
  public jsonHello() {
    return {
      message: "hello"
    };
  }
}
