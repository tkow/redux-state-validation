import {
  ArrayResultValue,
  Error,
  ObjectResultValue,
  ResultValue,
  Validator
} from "./types";

export type ReturnType = "object" | "array";

export interface InternalParams<T extends ResultValue> {
  results: T;
}

export interface WithErrorOptions<T, Action> {
  validator: Validator<T, Action>;
  action?: Action;
}

export abstract class AbstractValidationWatcher<
  TReturnType extends ReturnType,
  Type extends ResultValue = TReturnType extends "array"
    ? ArrayResultValue
    : ObjectResultValue
> {
  public abstract withError: <T, Action>(
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ) => void;
  public abstract nextErrors: () => ResultValue;
  protected abstract internal: InternalParams<Type>;
  public abstract getErrorResults<T, Action>(
    results: ResultValue,
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ): ResultValue;
  public mapIdToObject = <Key extends string, Value extends ResultValue>(
    ids: Key[],
    prevStateArray: Value[],
    updateValue: Value
  ): Value => {
    console.log(ids);
    console.log(prevStateArray);
    let result: Value = updateValue;
    while (ids.length > 0) {
      const hierarchicalObject = prevStateArray.pop();
      const _key: string = ids.pop();
      result = {
        ...hierarchicalObject,
        [_key]: result
      };
    }
    console.log(result);
    return result;
  };
  public getCompositeObjectArray(keys: string[], obj: object) {
    let current = { ...obj };
    return keys.reduce((value, nextKey) => {
      current = current && current[nextKey];
      if (current) {
        return [...value, current];
      } else {
        return [...value, {}];
      }
    }, []);
  }
}
