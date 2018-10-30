import test from "ava";
import { createStore } from "redux";
import { isNumber } from "util";
import { watchRootReducer, withValidateReducer } from "./index";

const postalReducer = (
  state: {
    postalCode: number;
  },
  action: any
) => {
  if (action.type === "SET_NUMBER") {
    return {
      ...state,
      postalCode: 123
    };
  }
  if (action.type === "SET_STRING") {
    return {
      ...state,
      postalCode: "123r"
    };
  }
  return state;
};

const _validateReducer = withValidateReducer(postalReducer, [
  {
    error: {
      id: "postalCode",
      message: "Invalid PostalCode"
    },
    validate: _state => isNumber(_state.postalCode)
  }
]);

test("cleate reducer validation", async t => {
  const rootReducer = watchRootReducer(_validateReducer);
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(state.error.length === 1);
  t.deepEqual(state.error, [
    {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  ]);
  t.deepEqual(state.postalCode, 0);
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(state.error.length === 0);
  t.deepEqual(state.postalCode, 123);
});

test("cleate reducer validation", async t => {
  const rootReducer = watchRootReducer(_validateReducer, {
    errorStateId: "hoge"
  });
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(state.hoge.length === 1);
  t.deepEqual(state.hoge, [
    {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  ]);
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(state.hoge.length === 0);
});
