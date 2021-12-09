import {
  asksStateReaderTaskEitherW,
  chainW,
  fromTask,
  gets,
  modify,
  of,
  StateReaderTaskEither,
} from "fp-ts/StateReaderTaskEither";
import { pipe } from "fp-ts/function";

export * from "fp-ts/StateReaderTaskEither";

type Token = string;

type Resolved<V, R> = StateReaderTaskEither<any, R, never, V>;

type Resolution<V> = (t: string) => Resolved<V, any>;

type DependencyContainer<T extends Token = Token, V = any> = Record<
  T,
  Resolution<V>
>;

export function register<C extends DependencyContainer, T extends string, V>(
  r: T,
  resolution: Resolution<V>
) {
  return (c: C) => ({ ...c, [r]: resolution } as C & DependencyContainer<T, V>);
}

export function value<V>(value: V) {
  return (_: string) => of(value);
}

export function factory<V>(factory: () => V) {
  return (_: string) => of(factory());
}

export function cachedFactory<V>(factory: () => V) {
  return (r: string) =>
    pipe(
      gets((s: Record<any, any>) => {
        if (s[r] === undefined) {
          return factory();
        }
        return s[r];
      }),
      chainW((a) => pipe(modify((a1) => ({ ...a1, [r]: a }))))
    );
}

export function promise<
  R extends Promise<any>,
  V = R extends Promise<infer Z> ? Z : never
>(promise: R) {
  return (_: string) => pipe(fromTask(() => promise) as Resolved<V, any>);
}

export function resolve<
  V,
  T extends Token,
  R = DependencyContainer<never, never>
>(r: T) {
  return chainW((_) => getFromContext<V, T, R>(r));
}

export function getFromContext<
  V,
  T extends Token,
  R = DependencyContainer<never, never>
>(r: T) {
  return asksStateReaderTaskEitherW<
    R,
    unknown,
    DependencyContainer<T, V>,
    never,
    V
  >((r1: Record<any, any>) =>
    pipe(r1[r](r) as ReturnType<Resolution<V>>)
  ) as Resolved<V, R & Record<T, Resolution<V>>>;
}
