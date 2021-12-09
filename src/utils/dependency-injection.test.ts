import {
  cachedFactory,
  factory,
  promise,
  register,
  resolve,
  value,
} from "./dependency-injection";
import { expect, use } from "chai";
import { fpPlugin } from "./assertions";
import { Either, Right } from "fp-ts/Either";
import { constVoid, pipe } from "fp-ts/function";
import { of } from "fp-ts/StateReaderTaskEither";

use(fpPlugin);

const wait = (ms: number) => Promise.resolve((t: any) => setTimeout(t, ms));

describe("Functional Dependency Injection", function () {
  context("#register", function () {
    const getValue = (v: Either<any, any>) => (v as Right<any>).right[0];

    it("should register value", async function () {
      // Arrange
      const di = pipe({}, register("value", value(1)));

      // Act
      const resolution = await di["value"]("value")({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should register factory", async function () {
      // Arrange
      const numberFactory = factory(() => 1);
      const di = pipe({}, register("factory", numberFactory));

      // Act
      const resolution = await di["factory"]("factory")({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should register async factory", async function () {
      // Arrange
      const promised = wait(50).then((_) => 1);
      const di = pipe({}, register("promise", promise(promised)));

      // Act
      const resolution = await di["promise"]("promise")({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should register cached factory", async function () {
      // Arrange
      const factory = cachedFactory(() => ({ a: 1 }));
      const di = pipe({}, register("factory", factory));

      // Act
      const resolution = await di["factory"]("factory")({})(di)();
      const secondResolution = await di["factory"]("factory")({})(di)();

      // Assert
      expect(getValue(resolution)).equal(getValue(secondResolution));
    });
  });

  context("#resolve", function () {
    const getValue = (v: Either<any, any>) => (v as Right<any>).right[0];

    it("should resolve dependency", async function () {
      // Arrange
      const promised = wait(50).then((_) => 1);
      const di = pipe({}, register("promise", promise(promised)));

      // Act
      const resolution = await pipe(
        of(constVoid),
        resolve<number, "promise">("promise")
      )({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should resolve dependent dependency", async function () {
      // Arrange
      const promised = wait(50).then((_) => 1);
      const test = pipe(of({}), resolve<number, "promise">("promise"));

      const di = pipe(
        {},
        register("promise", promise(promised)),
        register("final", () => test)
      );

      // Act
      const resolution = await resolve<number, "final">("final")(of(constVoid))(
        {}
      )(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });
  });
});
