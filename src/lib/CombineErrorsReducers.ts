import { AnyAction, combineReducers, Reducer } from "redux";

export const combineErrorsReducers = (reducers: {
  [key: string]: Reducer<any, AnyAction> & {
    validateReducer: Reducer<any, AnyAction>;
  };
}): Reducer<any, AnyAction> =>
  combineReducers(
    Object.keys(reducers).reduce((next, reducerId) => {
      return {
        ...next,
        [reducerId]: reducers[reducerId].validateReducer
      };
    }, {})
  );
