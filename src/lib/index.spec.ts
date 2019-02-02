import test from "ava";
import { combineReducers, createStore } from "redux";
import { handleActions } from "redux-actions";
import { isNumber } from "util";
import {
  createStaticValidator,
  setValidatorResults,
  watchRootReducer,
  withValidateReducer
} from "./index";
import { Error } from "./types";

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

test("createStaticValidator correct works with Error", async t => {
  const rootReducer = watchRootReducer(_validateReducer);
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  const errors = store.getState().errors;
  const validatorsLocal = [
    {
      error: {
        id: "postalCode",
        message: "Invalid PostalCode"
      },
      validate: _state => isNumber(_state.postalCode)
    }
  ];
  const validate = createStaticValidator({ state: validatorsLocal });
  store.dispatch(validate({ state: { postalCode: "hoge" } }));
  const result = store.getState().errors;
  t.deepEqual(result, errors);
});

test("createStaticValidator correct works with no Error", async t => {
  const rootReducer = watchRootReducer(_validateReducer);
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_NUMBER" });
  const errors = store.getState().errors;
  const validatorsLocal = [
    {
      error: {
        id: "postalCode",
        message: "Invalid PostalCode"
      },
      validate: _state => isNumber(_state.postalCode)
    }
  ];
  const validate = createStaticValidator({ state: validatorsLocal });
  store.dispatch(validate({ state: { postalCode: 123 } }));
  const result = store.getState().errors;
  t.deepEqual(result, errors);
  t.deepEqual(result, {});
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
  t.deepEqual(state.postalCode, "123r");
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
  t.truthy((state.errors as { [id: string]: Error[] }).postalCode.length === 1);
  t.deepEqual(state.errors, {
    postalCode: [
      {
        id: "postalCode",
        message: "Invalid PostalCode"
      }
    ]
  });
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.errors as { [id: string]: Error[] }).length === 0);
});

test("create validation single reducer for array", async t => {
  const rootReducer = watchRootReducer(_validateReducer, {
    returnType: "array"
  });
  const store = createStore(rootReducer, { postalCode: 0 });
  store.dispatch({ type: "SET_STRING" });
  let state = store.getState();
  t.truthy((state.errors as { [id: string]: Error[] }).postalCode.length === 1);
  t.deepEqual(state.errors, {
    postalCode: [
      {
        id: "postalCode",
        message: "Invalid PostalCode"
      }
    ]
  });
  t.deepEqual(state.postalCode, "123r");
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.errors as { [id: string]: Error[] }).length === 0);
  t.deepEqual(state.postalCode, 123);
});

test("use action withValidator", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          error: {
            id: "postalCode",
            message: "Invalid PostalCode"
          },
          validate: (_, action: any) => Number(action.value) > 100
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
  t.deepEqual(state.postalCode, 123);
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
});

test("action validations run before reducers execution and return state soon if action invalid.", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          error: {
            id: "postalCode1",
            message: "Invalid PostalCode"
          },
          validate: (_, action: any) => Number(action.value) > 100
        },
        {
          error: {
            id: "postalCode2",
            message: "Invalid PostalCode"
          },
          validate: _ => false
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 2);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode1");
});

test("use afterReduce if need get all errors set validation", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          afterReduce: true,
          error: {
            id: "postalCode1",
            message: "Invalid PostalCode"
          },
          validate: (_, action: any) => Number(action.value) > 100
        },
        {
          error: {
            id: "postalCode2",
            message: "Invalid PostalCode"
          },
          validate: _ => false
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  let state = store.getState();
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  t.truthy(Object.keys(state.errors).length === 1);
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 2);
});

test("if useing strict option of validator, result are set by payload ", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          error: {
            id: "postalCode1",
            message: "Invalid PostalCode"
          },
          strict: true,
          validate: (_, action: any) => Number(action.value) < 100
        },
        {
          afterReduce: true,
          error: {
            id: "postalCode2",
            message: "Invalid PostalCode"
          },
          strict: true,
          validate: (_, _action: any) => false
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  let state = store.getState();
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode1");
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.postalCode, 0);
  store.dispatch({
    type: "SET_NUMBER",
    value: 1
  });
  state = store.getState();
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.postalCode, 0);
});

test("use idSelector restructure errors id", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          afterReduce: true,
          error: {
            id: "postalCode1",
            message: "Invalid PostalCode"
          },
          idSelector: (errorId, action: { meta?: { id: string } }) =>
            (action.meta && action.meta.id) + "/" + errorId,
          validate: (_, action: any) => Number(action.value) > 100
        },
        {
          error: {
            id: "postalCode2",
            message: "Invalid PostalCode"
          },
          idSelector: (errorId, action: { meta?: { id: string } }) =>
            (action.meta && action.meta.id) + "/" + errorId,
          validate: _ => false
        }
      ])
    })
  );
  const store = createStore(rootReducer);
  store.dispatch({
    meta: {
      id: "addidSelector"
    },
    type: "SET_NUMBER",
    value: 0
  });
  const state = store.getState();
  t.truthy(
    (state.errors as any)["addidSelector/postalCode1"].id === "postalCode1"
  );
  t.truthy(
    (state.errors as any)["addidSelector/postalCode2"].id === "postalCode2"
  );
  t.truthy(Object.keys(state.errors).length === 2);
  t.deepEqual(state.errors, {
    "addidSelector/postalCode1": {
      id: "postalCode1",
      message: "Invalid PostalCode"
    },
    "addidSelector/postalCode2": {
      id: "postalCode2",
      message: "Invalid PostalCode"
    }
  });
});

test("use idSelector restructure errors id for array", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      postalCode: withValidateReducer(initialStateUndefinedReducer, [
        {
          afterReduce: true,
          error: {
            id: "postalCode1",
            message: "Invalid PostalCode"
          },
          idSelector: (errorId, action: { meta?: { id: string } }) =>
            (action.meta && action.meta.id) || errorId,
          validate: (_, action: any) => Number(action.value) > 100
        },
        {
          error: {
            id: "postalCode2",
            message: "Invalid PostalCode"
          },
          idSelector: (errorId, action: { meta?: { id: string } }) =>
            (action.meta && action.meta.id) || errorId,
          validate: _ => false
        }
      ])
    }),
    {
      returnType: "array"
    }
  );
  const store = createStore(rootReducer);
  store.dispatch({
    meta: {
      id: "addidSelector"
    },
    type: "SET_NUMBER",
    value: 0
  });
  const state = store.getState();
  t.truthy((state.errors as any).addidSelector[0].id === "postalCode1");
  t.truthy((state.errors as any).addidSelector[1].id === "postalCode2");
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy((state.errors as any).addidSelector.length === 2);
  t.deepEqual(state.errors as any, {
    addidSelector: [
      {
        id: "postalCode1",
        message: "Invalid PostalCode"
      },
      {
        id: "postalCode2",
        message: "Invalid PostalCode"
      }
    ]
  });
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
  t.truthy((state.hoge as { [id: string]: Error[] }).postalCode.length === 1);
  t.deepEqual(state.hoge, {
    postalCode: [
      {
        id: "postalCode",
        message: "Invalid PostalCode"
      }
    ]
  });
  store.dispatch({ type: "SET_NUMBER" });
  state = store.getState();
  t.truthy(Object.keys(state.hoge).length === 0);
});

test("can set action for errors", async t => {
  const action = setValidatorResults({ foo: { id: "bar", message: "error" } });
  t.deepEqual(action, {
    payload: { foo: { id: "bar", message: "error" } },
    type: "@@REDUX_STATE_VALIDATION/SET_VALIDATIONS"
  });
});
