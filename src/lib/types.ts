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
