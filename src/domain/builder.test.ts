import { expect } from "chai";
import { builder } from "./builder";

type TestType = { id: string; value?: number };
type ComplexTestType = { id: string; value?: TestType };

describe("builder", function () {
  it("should build object", function () {
    // Arrange
    const b = builder<TestType>().id("123").value(123);

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123", value: 123 });
  });

  it("should not require optional parameters", function () {
    // Arrange
    const b = builder<TestType>().id("123");

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123" });
  });

  it("should create copy of builder", function () {
    // Arrange
    const b1 = builder<TestType>().id("123");

    // Act
    const b2 = b1.value(123);

    // Assert
    expect(b1).not.equal(b2);
  });

  it("should accept builder as parameter", function () {
    // Arrange
    const b = builder<ComplexTestType>()
      .id("123")
      .value(builder<TestType>().id("123").value(123));

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123", value: { id: "123", value: 123 } });
  });

  it("should add element to collections using with* method", function () {
    // Arrange
    type TestType = { id: string; values?: number[] };
    const b = builder<TestType>().id("123").withValues(1).withValues(2);

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123", values: [1, 2] });
  });

  it("should add element to collections using with* method by providing list of values", function () {
    // Arrange
    type TestType = { id: string; values?: number[] };
    const b = builder<TestType>().id("123").withValues(1, 2);

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123", values: [1, 2] });
  });

  it("should add add element to collections using with* method by providing list of builders", function () {
    // Arrange
    type ComplexTestType = { id: string; values?: TestType[] };
    const testBuilder = builder<TestType>().id("123");
    const b = builder<ComplexTestType>()
      .id("123")
      .withValues(testBuilder.value(1), { id: "123", value: 2 });

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({
      id: "123",
      values: [
        { id: "123", value: 1 },
        { id: "123", value: 2 },
      ],
    });
  });

  it("should add element to collections using with* method when initial value already provided", function () {
    // Arrange
    type TestType = { id: string; values?: number[] };
    const b = builder<TestType>()
      .id("123")
      .values([1])
      .withValues(2)
      .withValues(3);

    // Act
    const v = b.build();

    // Assert
    expect(v).deep.equal({ id: "123", values: [1, 2, 3] });
  });
});
