import { ValidationWatcherFactory } from "./ValidationWatcherFactory";

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

export function getInstance() {
  const {
    watchRootReducer,
    withValidateReducer
  } = new ValidationWatcherFactory();
  return {
    watchRootReducer,
    withValidateReducer
  };
}

export const { withValidateReducer, watchRootReducer } = getInstance();
