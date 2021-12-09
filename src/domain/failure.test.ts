import { expect } from "chai";
import { Failure, failure, fromError } from "./failure";

describe("failure", function () {
  it("should return domain error", function () {
    // Arrange
    type SomeError = Failure<"SomeError">;

    // Act
    const e = failure("SomeError", "Error message");

    // Assert
    expect(e).with.property("_tag", "SomeError");
    expect(e).with.property("message", "Error message");
  });

  it("should map error to domain error", function () {
    // Arrange
    type SomeError = Failure<"SomeError">;
    const error = new Error("Error message");

    // Act
    const domainError = fromError("SomeError")(error);

    // Assert
    expect(domainError).with.property("_tag", "SomeError");
    expect(domainError).with.property("message", "Error message");
    expect(domainError.cause).equal(error);
  });
});
