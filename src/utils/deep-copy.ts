import deepcopy from "deepcopy";

export function copy<T>(obj: T): T {
  return deepcopy(obj);
}
