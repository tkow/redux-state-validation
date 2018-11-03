import test from "ava";
import { combineReducers, createStore } from "redux";
import { handleActions } from "redux-actions";
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

const initialStateUndefinedReducer = handleActions(
  {
    SET_NUMBER: () => 123
  },
  0
);

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

test("initial state not filter if the condition is invalid", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          error: {
            id: "postalCode",
            message: "Invalid PostalCode"
          },
          validate: _state => Number(_state) > 100
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  const state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
  t.truthy(state.postalCode === 0);
});

test("whether combineReducers can validate for object", async t => {
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
    })
  );
  const store = createStore(rootReducer, {
    me: "me",
    postalState: {
      postalCode: 0 as number
    }
  });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
});

test("create validation single reducer object", async t => {
  const rootReducer = watchRootReducer(_validateReducer);
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
  t.deepEqual(state.postalCode, 0);
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
  t.deepEqual(state.postalCode, 123);
});

test("whether combineReducers can validate for array", async t => {
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

test("create validation single reducer for array", async t => {
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

test("can rename errorStateId for object", async t => {
  const rootReducer = watchRootReducer(_validateReducer, {
    errorStateId: "hoge"
  });
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy(Object.keys(state.hoge).length === 1);
  t.deepEqual(state.hoge, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.hoge).length === 0);
});

test("can rename errorStateId for array", async t => {
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