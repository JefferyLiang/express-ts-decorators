import { expect } from "chai";
import app from "../service/app";
import axios from "axios";

describe("Demo", () => {
  before(async () => {
    app.listen(3000);
  });

  context("hello", () => {
    it("should return hello string", async () => {
      let result = await axios.get(
        "http://localhost:3000/api/hello?name=hello123"
      );
      expect(result.data).to.equal("hello");
    });
    it("should return hello json", async () => {
      let result = await axios.get("http://localhost:3000/api/hello/json");
      expect(result.data.message).to.equal("hello");
    });
  });
});
