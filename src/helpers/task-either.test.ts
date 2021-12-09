import { flow } from "fp-ts/function";
import { Failure } from "../domain/failure";
import { mapError, mapSuccess } from "./task-either";
import { left, of } from "fp-ts/TaskEither";
import { expect } from "chai";

describe("TaskEither", function () {
  context("#mapError", function () {
    it("should map error to failure", async function () {
      // Arrange
      type SomeError = Failure<"SomeError">;
      const error = left(new Error("Error"));

      // Act
      const result = flow(mapError("SomeError"))(error);

      // Assert
      expect(await result()).to.have.nested.property("left._tag", "SomeError");
    });
  });
  context("#mapSuccess", function () {
    it("should map result to success", async function () {
      // Arrange
      const obj = of({});

      // Act
      const result = flow(mapSuccess(obj));

      // Assert
      expect(await result()).to.have.nested.property("right").to.be.undefined;
    });
  });
});
