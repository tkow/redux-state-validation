import { Error } from "./types";

export type ReturnType = "object" | "array";
export type ResultValue = Error[] | { [id: string]: Error };
export interface InternalParams<T extends ResultValue> {
  results: T;
}

export abstract class AbstractValidationWatcher<
  TReturnType extends ReturnType,
  Type extends ResultValue = TReturnType extends "array"
    ? Error[]
    : { [id: string]: Error }
> {
  public abstract withError: (error: Error) => void;
  public abstract nextErrors: () => ResultValue;
  protected abstract internal: InternalParams<Type>;
}
