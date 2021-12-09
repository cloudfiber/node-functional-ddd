import {
  factory,
  getFromContext,
  promise,
  register,
  resolve,
  value,
} from "./dependency-injection";
import { expect, use } from "chai";
import { fpPlugin } from "./assertions";
import { Either, Right } from "fp-ts/Either";
import { constVoid, pipe } from "fp-ts/function";
import { apSW, map, of } from "fp-ts/StateReaderTaskEither";

use(fpPlugin);

const wait = (ms: number) => Promise.resolve((t: any) => setTimeout(t, ms));

describe("Functional Dependency Injection", function () {
  context("#register", function () {
    const getValue = (v: Either<any, any>) => (v as Right<any>).right[0]();

    it("should register value", async function () {
      // Arrange
      const di = pipe({}, register("value", value(1)));

      // Act
      const resolution = await di["value"]({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should register factory", async function () {
      // Arrange
      const numberFactory = factory(() => 1);
      const di = pipe({}, register("factory", numberFactory));

      // Act
      const resolution = await di["factory"]({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });

    it("should register async factory", async function () {
      // Arrange
      const promised = wait(50).then((_) => 1);
      const di = pipe({}, register("promise", promise(promised)));

      // Act
      const resolution = await di["promise"]({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
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
      const test = pipe(
        of({}),
        resolve<number, "promise">("promise"),
        map((a) => () => a)
      );

      const di = pipe(
        {},
        register("promise", promise(promised)),
        register("final", test)
      );

      // Act
      const resolution = await pipe(
        of(constVoid),
        resolve<number, "final">("final")
      )({})(di)();

      // Assert
      expect(getValue(resolution)).equal(1);
    });
  });

  context("#combine", function () {
    const getValue = (v: Either<any, any>) => (v as Right<any>).right[0];

    it("should combine resolutions into object", async function () {
      // Arrange
      const di = pipe(
        {},
        register("v1", value(1)),
        register("v2", value(2)),
        register(
          "combined",
          pipe(
            of({}),
            apSW("v1", getFromContext<number, "v1">("v1")),
            apSW("v2", getFromContext<string, "v2">("v2")),
            map((a) => () => a)
          )
        )
      );
      // Act
      const resolution = await pipe(
        of(constVoid),
        resolve<{ v1: number; v2: number }, "combined">("combined")
      )({})(di)();

      // Assert
      expect(getValue(resolution)).deep.equal({ v1: 1, v2: 2 });
    });
  });
});
