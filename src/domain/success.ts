import { constVoid } from "fp-ts/function";

export type Success = void;

export function success(): Success {
  return constVoid();
}
