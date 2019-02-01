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
  public mapIdToObject = <Key extends string,Value extends ResultValue>(ids: Key[],value:Value) : Value => {
    return ids.reverse().reduce((obj:object,nextId:string) => {
      return {
        [nextId]: obj
      }
    },value) as Value
  }
}
