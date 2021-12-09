import {
  asksStateReaderTaskEitherW,
  chainW,
  fromTask,
  map,
  of,
  StateReaderTaskEither,
} from "fp-ts/StateReaderTaskEither";
import { constVoid, pipe } from "fp-ts/function";
import { randomUUID } from "crypto";

export * from "fp-ts/StateReaderTaskEither";

type Token = string;

type Resolved<V, R> = StateReaderTaskEither<any, R, never, V>;

type Resolution<V> = Resolved<() => V, any>;

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
  return of(() => value);
}

export function factory<V>(factory: () => V) {
  return of(factory);
}

export function promise<
  R extends Promise<any>,
  V = R extends Promise<infer Z> ? Z : never
>(promise: R) {
  return pipe(
    fromTask(() => promise) as Resolved<V, any>,
    map((resolution) => () => resolution)
  );
}

export function resolve<
  V,
  T extends Token,
  R = DependencyContainer<never, never>
>(r: T) {
  return chainW((_) => getFromContext(r));
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
    pipe(
      r1[r] as Resolution<V>,
      map((a) => a())
    )
  ) as Resolved<V, R & Record<T, Resolution<V>>>;
}

export function combine<
  V,
  T extends Token,
  R = DependencyContainer<never, never>,
  Z = any,
  K = Z extends () => infer Y ? Y : never
>(r: T) {
  return chainW<
    unknown,
    R & Record<T, Resolution<V>>,
    never,
    () => Record<any, any>,
    () => K & Record<T, V>
  >((d: () => Record<any, any>) =>
    pipe(
      of(constVoid),
      resolve<V, T, R>(r),
      map((a) => (() => ({ ...d(), [r]: a })) as () => K & Record<T, V>)
    )
  );
}

//// FP testing

function registerValue<
  C extends Record<any, StateReaderTaskEither<any, any, never, () => any>>,
  T extends string,
  V
>(r: T, value: V) {
  return (c: C) =>
    ({
      ...c,
      [r]: of(() => value),
    } as C & Record<T, StateReaderTaskEither<any, any, never, () => V>>);
}

export function registerFactory<
  C extends Record<any, StateReaderTaskEither<any, any, never, () => any>>,
  T extends string,
  V
>(r: T, factory: () => V) {
  return (c: C) =>
    ({
      ...c,
      [r]: of(factory),
    } as C & Record<T, StateReaderTaskEither<any, any, never, () => V>>);
}

export function registerWithResolve<
  C extends Record<any, StateReaderTaskEither<any, any, never, () => any>>,
  T extends string,
  V
>(r: T, resolver: StateReaderTaskEither<any, any, never, V>) {
  return (c: C) =>
    ({
      ...c,
      [r]: pipe(
        resolver,
        map((r) => () => r)
      ),
    } as C & Record<T, StateReaderTaskEither<any, any, never, () => V>>);
}

export function resolveTest<V, T extends string, R = Record<never, never>>(
  r: T
) {
  return chainW(
    (_) =>
      asksStateReaderTaskEitherW<
        R,
        unknown,
        Record<T, StateReaderTaskEither<any, any, never, () => V>>,
        never,
        V
      >((r1: Record<any, any>) =>
        pipe(
          r1[r] as StateReaderTaskEither<any, any, never, () => V>,
          map((a) => a())
        )
      ) as StateReaderTaskEither<
        unknown,
        R & Record<T, StateReaderTaskEither<any, any, never, () => V>>,
        never,
        V
      >
  );
}

export function createContainerTest() {
  return pipe(
    {},
    registerValue("test", 2),
    registerValue("test2", "2"),
    registerWithResolve(
      "test3",
      pipe(
        of(constVoid),
        resolveTest<string, "test2">("test2"),
        chainW((a) =>
          pipe(
            of(a),
            resolveTest<number, "test">("test"),
            map((a1) => ({
              test2: a,
              test: a1,
            }))
          )
        )
      )
    ),
    registerFactory("test4", () => randomUUID())
  );
}

export function useTest() {
  return pipe(
    of(constVoid),
    resolveTest<number, "test">("test"),
    resolveTest<{ test: number; test2: string }, "test3">("test3")
  );
}

export function useTest2() {
  return pipe(of(constVoid), resolveTest<string, "test4">("test4"));
}

function executeS() {
  const di = createContainerTest();
  const result = useTest()({})(di);
  const result2 = useTest2()({})(di);
}
