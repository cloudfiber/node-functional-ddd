import { copy } from "../utils/deep-copy";

type BuilderParamMethod<T, P, R> = (v: P | IBuilder<unknown>) => IBuilder<T, R>;
type BuilderArrayParamMethod<T, P, R> = (
  ...v: Array<P | IBuilder<unknown>>
) => IBuilder<T, R>;

type IBuilder<T, B = Record<string, unknown>> = {
  [k in keyof T]-?: BuilderParamMethod<T, T[k], B & Record<k, T[k]>>;
} & {
  [k in keyof T as `with${Capitalize<string & k>}`]-?: T[k] extends
    | Array<infer R>
    | undefined
    ? BuilderArrayParamMethod<T, R, B & Record<k, T[k]>>
    : never;
} & {
  build: B extends T ? () => T : never;
};

export function builder<T>(last?: Record<string, unknown>): IBuilder<T> {
  const built: Record<string, unknown> = last ?? {};

  const proxy = new Proxy(
    {},
    {
      get(target, prop) {
        if ("build" === prop) {
          return () => copy(built);
        }

        if (prop.toString().startsWith("with")) {
          return (...v: Array<IBuilder<unknown> | any>): unknown => {
            const newValues: unknown[] = [];
            for (let vElement of v) {
              if (isBuilder(vElement)) {
                newValues.push(vElement.build());
              } else {
                newValues.push(vElement);
              }
            }
            return builder<T>({
              ...copy(built),
              [prop.toString().substring(4).toLowerCase()]: [
                ...((built[
                  prop.toString().substring(4).toLowerCase()
                ] as Array<any>) ?? []),
                ...newValues,
              ],
            });
          };
        }

        return (x: IBuilder<unknown> | any): unknown => {
          if (isBuilder(x)) {
            return builder<T>({ ...copy(built), [prop]: x.build() });
          }
          return builder<T>({ ...copy(built), [prop]: x });
        };
      },
    }
  );

  return proxy as IBuilder<T>;
}

function isBuilder<T>(b: IBuilder<T>): b is IBuilder<T> {
  return (b as IBuilder<T>).build !== undefined;
}
