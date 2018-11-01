import test from "ava";
import { combineReducers, createStore } from "redux";
import { isNumber } from "util";
import { watchRootReducer, withValidateReducer } from "./index";

const postalReducer = (
  state: {
    postalCode: number;
  } = {
    postalCode: 0
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

const identityReducer = (state: string = "hoge", action: { value: string }) => {
  return action && action.value ? action.value : state;
};

test("create reducer validation", async t => {
  const _validateNestReducer = withValidateReducer(postalReducer, [
    {
      error: {
        id: "postalCode",
        message: "Invalid PostalCode"
      },
      validate: _state => {
        return isNumber(_state.postalCode);
      }
    }
  ]);
  const rootReducer = watchRootReducer(
    combineReducers({
      me: identityReducer,
      postalState: _validateNestReducer
    }),
    {
      returnType: "array"
    }
  );
  const store = createStore(rootReducer, {
    me: "me",
    postalState: {
      postalCode: 0 as number
    }
  });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(state.errors.length === 1);
  t.deepEqual(state.errors, [
    {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  ]);
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(state.errors.length === 0);
});

test("create reducer validation", async t => {
  const rootReducer = watchRootReducer(_validateReducer, {
    returnType: "array"
  });
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(state.errors.length === 1);
  t.deepEqual(state.errors, [
    {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  ]);
  t.deepEqual(state.postalCode, 0);
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(state.errors.length === 0);
  t.deepEqual(state.postalCode, 123);
});

test("can rename errorStateId", async t => {
  const rootReducer = watchRootReducer(_validateReducer, {
    errorStateId: "hoge",
    returnType: "array"
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
