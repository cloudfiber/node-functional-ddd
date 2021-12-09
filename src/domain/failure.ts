export type Failure<T extends string> = Readonly<
  Error & { _tag: T; cause?: Error }
>;

export function failure<T extends string>(tag: T, reason: unknown): Failure<T> {
  return {
    _tag: tag,
    name: tag,
    message: typeof reason === "string" ? reason : toError(reason).message,
    cause: isError(reason) ? reason : undefined,
  };
}

type MapDomainError<T extends string> = (reason: unknown) => Failure<T>;

export function fromError<T extends string>(tag: T): MapDomainError<T> {
  return (reason) => failure(tag, reason);
}

function toError<T extends string>(reason: unknown): Error {
  return isError(reason)
    ? reason
    : {
        name: "Error",
        message: typeof reason === "string" ? reason : JSON.stringify(reason),
      };
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}
