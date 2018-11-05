import { ValidationWatcherFactory } from "./ValidationWatcherFactory";
export { Validator, Error } from "./types";

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
