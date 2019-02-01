import { ValidationWatcherFactory } from "./ValidationWatcherFactory";
export { Validator, Error } from "./types";

export { ValidationWatcherFactory };

export function getInstance() {
  return new ValidationWatcherFactory();
}

export const {
  withValidateReducer,
  watchRootReducer,
  createStaticValidator,
  setValidatorResults
} = getInstance();
