import { Error, ResultValue, Validator } from "./types";

export type ReturnType = "object" | "array";

export interface InternalParams<T extends ResultValue> {
  results: T;
}

export interface WithErrorOptions<T, Action> {
  validator: Validator<T, Action>;
  action: Action;
}

export abstract class AbstractValidationWatcher<
  TReturnType extends ReturnType,
  Type extends ResultValue = TReturnType extends "array"
    ? Error[] | { [id: string]: Error[] }
    : { [id: string]: Error | { [id: string]: Error } }
> {
  public abstract withError: <T, Action>(
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ) => void;
  public abstract nextErrors: () => ResultValue;
  protected abstract internal: InternalParams<Type>;
}
