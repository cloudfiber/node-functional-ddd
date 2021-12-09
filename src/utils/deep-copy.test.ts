import { expect } from "chai";
import { copy } from "./deep-copy";

describe("copy", function () {
  it("should copy object", function () {
    // Arrange
    const obj = { a: 1, b: { c: 1 } };

    // Act
    const objCopy = copy(obj);

    // Assert
    expect(objCopy).not.equal(obj);
    expect(objCopy).deep.equal(obj);
    expect(objCopy.b).not.equal(obj.b);
    expect(objCopy.b).deep.equal(obj.b);
  });
});
