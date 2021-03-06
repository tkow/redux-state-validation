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

  public abstract resetErrors: () => void;
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
    let result: Value | { [key: string]: Value } = updateValue;
    while (ids.length > 0) {
      const hierarchicalObject = prevStateArray.pop();
      const _key: string = ids.pop();
      result = {
        [_key]: {
          ...hierarchicalObject,
          ...result
        }
      };
    }
    return {
      ...prevStateArray.pop(),
      ...result
    } as Value;
  };

  public getCompositeObjectArray(keys: string[], obj: object) {
    let current = { ...obj };
    return keys.reduce(
      (value, nextKey) => {
        current = current && current[nextKey];
        if (current) {
          return [...value, current];
        } else {
          return [...value, {}];
        }
      },
      [current]
    );
  }
}
