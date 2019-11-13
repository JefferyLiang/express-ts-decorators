import { Controller, Get } from "../../lib/Contoller";

@Controller("/api/hello")
export class Hello {
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
