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
  idSelector?(id: string, action: Action): string;
  validate(state: T, action?: Action): boolean;
}

export interface ArrayResultValue {
  [id: string]: Error[];
}
export interface ObjectResultValue {
  [id: string]: Error | { [id: string]: Error };
}

export type ResultValue = ArrayResultValue | ObjectResultValue;
