import { Assertion } from "chai";
import { Left, Right } from "fp-ts/Either";

declare global {
  export namespace Chai {
    interface Assertion {
      left: Assertion;
      right: Assertion;
      error: (type: string) => Assertion;
    }
  }
}

export function fpPlugin(_chai: typeof Chai, utils: Chai.ChaiUtils) {
  Assertion.addProperty("left", function () {
    const obj = this._obj as Left<any>;
    this.assert(
      obj._tag === "Left",
      "is not Left",
      "is Left",
      "Left",
      obj._tag,
      true
    );
    utils.flag(this, "object", obj.left);
  });

  Assertion.addProperty("right", function () {
    const obj = this._obj as Right<any>;
    this.assert(
      obj._tag === "Right",
      "is not Right:\n" + getErrorMessage((obj as any).left),
      "is Right",
      "Right",
      obj._tag,
      true
    );
    utils.flag(this, "object", obj.right);
  });

  Assertion.addMethod("error", function (type: string) {
    const obj = this._obj as Left<any>;
    new Assertion(obj).is.left.with.property("name").equal(type);
  });

  function getErrorMessage(error: any) {
    if (error instanceof Error) {
      return "Error message: " + error.message;
    }
    return JSON.stringify(error);
  }
}
