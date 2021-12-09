import { ReaderTaskEither } from "fp-ts/ReaderTaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import { Failure } from "../domain/failure";
import { Success } from "../domain/success";

export type Command = Readonly<Record<string, unknown>>;
export type InteractionFailure<T extends string> = Failure<T>;

export type Interaction<R, E extends InteractionFailure<string>, A> = (
  command: Command
) => ReaderTaskEither<R, E, A>;

type TransactionFailure = Failure<"TransactionError">;
type TransactionCommand = "start" | "commit" | "rollback";
type TransactionResult = TaskEither<TransactionFailure, Success>;

type TransactionalContext = {
  transaction: (command: TransactionCommand) => TransactionResult;
};

export type TransactionalInteractionFailure<T extends string> =
  | InteractionFailure<T>
  | TransactionFailure;

export type TransactionalInteraction<
  R extends TransactionalContext,
  E extends TransactionalInteractionFailure<any>,
  A
> = Interaction<R, E, A>;
