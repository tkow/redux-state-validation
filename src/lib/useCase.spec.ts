import test from "ava";
import { combineReducers, createStore } from "redux";
import { watchRootReducer, withValidateReducer } from "./index";

const numberReducer = (number: number = 0, action: any) => {
  if (action.type === "SET_NUMBER") {
    return action.payload as number;
  }
  return number;
};

const nameReducer = (name: string = "", action: any) => {
  if (action.type === "SET_NAME") {
    return action.payload as string;
  }
  return name;
};

test("redux state usage example object mode", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      name: withValidateReducer(nameReducer, [
        {
          error: {
            id: "emptyname",
            message: "empty Name"
          },
          idSelector: (errorId, _action: { meta?: { id: string } }) => [
            "person",
            "name",
            errorId
          ],
          validate: name => name !== ""
        },
        {
          afterReduce: true,
          error: {
            id: "invalidname",
            message: "Invalid name"
          },
          idSelector: (errorId, _action: { meta?: { id: string } }) => [
            "person",
            "name",
            errorId
          ],
          validate: (name, _action: any) => {
            return name.length > 0;
          }
        }
      ]),
      number: withValidateReducer(numberReducer, [
        {
          error: {
            id: "zero",
            message: "zero is forbidden"
          },
          idSelector: (errorId, _action: { meta?: { id: string } }) => [
            "person",
            "number",
            errorId
          ],
          validate: state => state !== 0
        },
        {
          error: {
            id: "lessthanhundred",
            message: "Invalid number"
          },
          idSelector: (errorId, _action: { meta?: { id: string } }) => [
            "person",
            "number",
            errorId
          ],
          validate: (state, _action: any) => state >= 100
        }
      ])
    }),
    {
      returnType: "object"
    }
  );
  const store = createStore(rootReducer, { name: "foo", number: 0 });
  store.dispatch({
    payload: 50,
    type: "SET_NUMBER"
  });
  store.dispatch({
    payload: "",
    type: "SET_NAME"
  });
  const state = store.getState();

  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    person: {
      name: {
        emptyname: {
          id: "emptyname",
          message: "empty Name"
        },
        invalidname: {
          id: "invalidname",
          message: "Invalid name"
        }
      },
      number: {
        lessthanhundred: {
          id: "lessthanhundred",
          message: "Invalid number"
        }
      }
    }
  });
});

test("redux state usage example array mode", async t => {
  const rootReducer = watchRootReducer(
    combineReducers({
      name: withValidateReducer(nameReducer, [
        {
          afterReduce: true,
          error: {
            id: "emptyname",
            message: "empty Name"
          },
          idSelector: (_errorId, _action: { meta?: { id: string } }) => [
            "person",
            "name"
          ],
          validate: name => name !== ""
        },
        {
          afterReduce: true,
          error: {
            id: "invalidname",
            message: "Invalid name"
          },
          idSelector: (_errorId, _action: { meta?: { id: string } }) => [
            "person",
            "name"
          ],
          validate: (name, _action: any) => {
            return name.length > 0;
          }
        }
      ]),
      number: withValidateReducer(numberReducer, [
        {
          error: {
            id: "zero",
            message: "zero is forbidden"
          },
          idSelector: (_errorId, _action: { meta?: { id: string } }) => [
            "person",
            "number"
          ],
          validate: state => state !== 0
        },
        {
          error: {
            id: "lessthanhundred",
            message: "Invalid number"
          },
          idSelector: (_errorId, _action: { meta?: { id: string } }) => [
            "person",
            "number"
          ],
          validate: (state, _action: any) => state >= 100
        }
      ])
    })
  );
  const store = createStore(rootReducer, { name: "foo", number: 0 });
  store.dispatch({
    payload: 50,
    type: "SET_NUMBER"
  });
  store.dispatch({
    payload: "",
    type: "SET_NAME"
  });
  const state = store.getState();

  t.truthy(Object.keys(state.errors).length === 1);
  t.deepEqual(state.errors, {
    person: {
      name: [
        {
          id: "emptyname",
          message: "empty Name"
        },
        {
          id: "invalidname",
          message: "Invalid name"
        }
      ],
      number: [
        {
          id: "lessthanhundred",
          message: "Invalid number"
        }
      ]
    }
  });
});
