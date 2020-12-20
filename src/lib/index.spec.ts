import test from "ava";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { handleActions } from "redux-actions";
import { isNumber } from "util";
import {
  createMiddleware,
  createValidateReducer,
  validateActionCreater
} from "./index";

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
      postalCode: typeof action.value === "number" ? action.value : 123
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

const identityReducer = (state: string = "hoge", action: { value: string }) => {
  return action && action.value ? action.value : state;
};

test("initial state not filter if the condition is invalid", async t => {
  const validateReducer = createValidateReducer(
    initialStateUndefinedReducer,
    [
      {
        error: {
          id: "postalCode",
          message: "Invalid PostalCode"
        },
        validate: _state => Number(_state) > 100
      }
    ],
    { returnType: "object" }
  );
  const store = createStore(
    combineReducers({
      errors: validateReducer.validateReducer,
      postalCode: validateReducer
    })
  );
  const state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
  t.truthy(state.postalCode === 0);
});

test("whether combineReducers can validate for object", async t => {
  const _validateNestReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode",
          message: "Invalid PostalCode"
        },
        validate: _state => {
          return isNumber(_state.postalCode);
        }
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: _validateNestReducer.validateReducer,
    me: identityReducer,
    postalState: _validateNestReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0 as number
    }
  });
  store.dispatch({ type: "SET_STRING" });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
  store.dispatch({ type: "SET_NUMBER" });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
});

test("whether combineReducers can validate for array", async t => {
  const _validateNestReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode",
          message: "Invalid PostalCode"
        },
        validate: _state => {
          return isNumber(_state.postalCode);
        }
      }
    ],
    { returnType: "array" }
  );
  const rootReducer = combineReducers({
    errors: _validateNestReducer.validateReducer,
    me: identityReducer,
    postalState: _validateNestReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0 as number
    }
  });
  store.dispatch({ type: "SET_STRING" });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(state.errors.postalCode.length === 1);
  t.deepEqual(state.errors, {
    postalCode: [
      {
        id: "postalCode",
        message: "Invalid PostalCode"
      }
    ]
  });
  store.dispatch({ type: "SET_NUMBER" });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
});

test("use action withValidator", async t => {
  const postalCodeReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode",
          message: "Invalid PostalCode"
        },
        strict: true,
        validate: _state => {
          return isNumber(_state.postalCode);
        }
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: postalCodeReducer.validateReducer,
    me: identityReducer,
    postalState: postalCodeReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0
    }
  });

  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 0);
  t.deepEqual(state.postalState.postalCode, 0);
  store.dispatch({
    type: "SET_STRING"
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    postalCode: {
      id: "postalCode",
      message: "Invalid PostalCode"
    }
  });
  store.dispatch({
    type: "SET_NUMBER"
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.deepEqual(state.postalState.postalCode, 123);
  t.truthy(Object.keys(state.errors).length === 0);
});

test("action validations run before reducers execution and return state soon if action invalid.", async t => {
  const postalCodeReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode1",
          message: "Invalid PostalCode"
        },
        validate: (_, action: any) => {
          return Number(action.value) > 100;
        }
      },
      {
        error: {
          id: "postalCode2",
          message: "Invalid PostalCode"
        },
        validate: _ => false
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: postalCodeReducer.validateReducer,
    me: identityReducer,
    postalState: postalCodeReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0
    }
  });

  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.deepEqual(state.postalState.postalCode, 0);
  t.truthy(Object.keys(state.errors).length === 2);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode1");
});

test("action validations run before reducers execution and return state soon if strict mode.", async t => {
  const postalCodeReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode1",
          message: "Invalid PostalCode"
        },
        strict: true,
        validate: (_, action: any) => {
          return Number(action.value) > 100;
        }
      },
      {
        error: {
          id: "postalCode2",
          message: "Invalid PostalCode"
        },
        validate: _ => false
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: postalCodeReducer.validateReducer,
    me: identityReducer,
    postalState: postalCodeReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0
    }
  });

  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.deepEqual(state.postalState.postalCode, 123);
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode1");
});

test("use afterReduce if need get all errors set validation", async t => {
  const postalCodeReducer = createValidateReducer(
    postalReducer,
    [
      {
        afterReduce: true,
        error: {
          id: "postalCode1",
          message: "Invalid PostalCode"
        },
        strict: true,
        validate: (_, action: any) => {
          return Number(action.value) > 100;
        }
      },
      {
        error: {
          id: "postalCode2",
          message: "Invalid PostalCode"
        },
        validate: _ => false
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: postalCodeReducer.validateReducer,
    me: identityReducer,
    postalState: postalCodeReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0
    }
  });

  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  store.dispatch({
    type: "SET_NUMBER",
    value: 0
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.deepEqual(state.postalState.postalCode, 123);
  t.truthy(Object.keys(state.errors).length === 2);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode1");
});

test("use idSelector restructure errors id", async t => {
  const postalCodeReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode1",
          message: "Invalid PostalCode"
        },
        idSelector: (errorId, action: { meta?: { id: string } }) =>
          `${action.meta && action.meta.id}_${errorId}` || errorId,
        validate: (_, action: any) => {
          return Number(action.value) > 100;
        }
      },
      {
        error: {
          id: "postalCode2",
          message: "Invalid PostalCode"
        },
        validate: _ => false
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: postalCodeReducer.validateReducer,
    me: identityReducer,
    postalState: postalCodeReducer
  });

  const store = createStore(rootReducer, {
    errors: {},
    me: "me",
    postalState: {
      postalCode: 0
    }
  });

  store.dispatch({
    type: "SET_NUMBER",
    value: 123
  });
  store.dispatch(validateActionCreater());
  let state = store.getState();
  t.truthy(Object.keys(state.errors).length === 1);
  t.truthy(state.errors[Object.keys(state.errors)[0]].id === "postalCode2");
  store.dispatch({
    meta: {
      id: "addidSelector"
    },
    type: "SET_NUMBER",
    value: 0
  });
  store.dispatch(validateActionCreater());
  state = store.getState();
  t.truthy(Object.keys(state.errors).length === 2);
  t.truthy(state.errors.addidSelector_postalCode1.id === "postalCode1");
});

test("middleware auto validate action dispatch", async t => {
  const _validateNestReducer = createValidateReducer(
    postalReducer,
    [
      {
        error: {
          id: "postalCode",
          message: "Invalid PostalCode"
        },
        validate: _state => {
          return isNumber(_state.postalCode);
        }
      }
    ],
    { returnType: "object" }
  );
  const rootReducer = combineReducers({
    errors: _validateNestReducer.validateReducer,
    me: identityReducer,
    postalState: _validateNestReducer
  });

  const store = createStore(
    rootReducer,
    {
      errors: {},
      me: "me",
      postalState: {
        postalCode: 0 as number
      }
    },
    applyMiddleware(createMiddleware())
  );
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
