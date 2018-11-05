export interface Error {
  id: string;
  message: string;
}

export interface Validator<T, Action = any> {
  error: Error;
  afterReduce?: boolean;
  idSelecter?(id: number, action: Action): number;
  idSelecter?(id: string, action: Action): string;
  validate(state: T, action?: Action): boolean;
}

export type ReturnType = "object" | "array";

export type ResultValue = Error[] | { [id: string]: Error };

export interface Config<T extends string, R extends ReturnType> {
  errorStateId?: T;
  returnType?: R;
}

export interface InternalParams<T extends ResultValue> {
  results: T;
}

export interface Reducer<State extends {}, Action> {
  (state: State, action: Action): State;
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
