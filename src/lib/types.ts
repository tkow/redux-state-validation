export interface Error {
  id: string;
  message: string;
}

export interface ReduxAction {
  type: string;
}

export interface Validator<T, Action = ReduxAction> {
  error: Error;
  afterReduce?: boolean;
  strict?: boolean;
  idSelector?(id?: string, action?: Action): string | string[];
  validate(state: T, action?: Action): boolean;
}

export type RecursiveArrayType = Error[] | { [id: string]: RecursiveArrayType };

export interface ArrayResultValue {
  [id: string]: RecursiveArrayType;
}

export type RecursiveObjectType = Error | { [id: string]: RecursiveObjectType };

export interface ObjectResultValue {
  [id: string]: RecursiveObjectType;
}

export type ResultValue = ArrayResultValue | ObjectResultValue;
