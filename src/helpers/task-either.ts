import { map, mapLeft, TaskEither } from "fp-ts/TaskEither";
import { fromError } from "../domain/failure";
import { success, Success } from "../domain/success";

export * from "fp-ts/TaskEither";

export function mapError<T extends string>(type: T) {
  return mapLeft(fromError(type));
}

export function mapSuccess<E>(
  fa: TaskEither<E, unknown>
): TaskEither<E, Success> {
  return map((_) => success())(fa);
}
