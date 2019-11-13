import { Controller, Get } from "../../lib/Contoller";
import { Validator } from "../../lib/Validator";
import * as Joi from "@hapi/joi";

@Controller("/api/hello")
export class Hello {
  @Validator({
    query: Joi.object()
      .keys({
        name: Joi.string().required()
      })
      .required()
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
