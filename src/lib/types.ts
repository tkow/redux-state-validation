export interface Error {
  id: string;
  message: string;
}

export interface Validator<T, Action = any> {
  error: Error;
  afterReduce?: boolean;
  strict?: boolean;
  idSelecter?(id: string, action: Action): string;
  validate(state: T, action?: Action): boolean;
}

export type ArrayResultValue = Error[] | { [id: string]: Error[] };
export interface ObjectResultValue {
  [id: string]: Error | { [id: string]: Error };
}

export type ResultValue = ArrayResultValue | ObjectResultValue;
