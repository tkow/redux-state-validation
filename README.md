[![NPM](https://nodei.co/npm/redux-state-validation.png)](https://nodei.co/npm/redux-state-validation/)
[![npm version](https://badge.fury.io/js/redux-state-validation.svg)](https://badge.fury.io/js/redux-state-validation)
[![codecov](https://codecov.io/gh/tkow/redux-state-validation/branch/master/graph/badge.svg)](https://codecov.io/gh/tkow/redux-state-validation)
[![GitHub stars](https://img.shields.io/github/stars/tkow/redux-state-validation.svg?style=social&logo=github&label=Stars)](https://github.com/tkow/redux-state-validation)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


# redux-state-validation

Add validator to reducer's result handy. Common validator have problem that depends on form or action thus, will be inclined to be weak by modification or increse redundant definitions.This library is simple to extend state array has arbitrary name (default:errors) with checking error and set the messages after each reducer's callback.

# Usage


## withValidateReducer(reducer:Reducer<State,action:Action>, validator:{
  id:string
  validate(state:State): boolean
}[]):Reducer(state:State,action:Action)

Type Parameter `Key` is corresponded to errorStateId's value in option which is second arguments of watchRootReducer. this API chains a reducer function to validation callback and if the result's not valid rollback state the previous one with save error object to internal state along configuration.

## watchRootReducer(reducer:Reducer<State,action:Action>,options?:{
  errorStateId?:string
}):Reducer(state:State&Record<Key, Error[]>,action:Action)

This API writes errors of validate methods to redux state, the depth can be arbitrary as how deep you apply watchRootReducer to selected reducer . This must call after all validate methods in the watchRootReducer applied to reducer's scope.This means we must not call watchRootReducer to get errors of parent's reducers or higher than them.This API must use to watch about child reducers or the reducer itself whether validation methods find errors, otherwise it is possible to start flushing errors to state though some validate method still aren't called  depends on the order of function invokes. Imagine the tree ,this derived one root node has many child nodes and decendants and depth-first search recuring process. Imagine one of these nodes is reducer,and the reducer executes fastest than the chirdlen and return last its'state. The callback set by watchRootReducer run after the reducer's return values, so the reducer can watch about all decendants and itself whether catch errors, therefore first origin node reducer is able to watch all of reducers it includes as decendants. So I highly recomend to control error states at top reducer.

The example is followed by

```typescript
import {
  withValidateReducer,
  watchRootReducer
} from 'redux-state-validation'

const postalReducer = (
  state: {
    postalCode
  },
  action
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
      postalCode: "123"
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

const rootReducer = watchRootReducer(_validateReducer, {
  errorStateId: "hoge"
});

const store = createStore(rootReducer, { postalCode: 0 });

store.dispatch({ type: "SET_STRING" });

/**
*  store.getState()
*  the output:
*  {
*     postalCode:0,
*     hoge: [
*       {
*         id: "postalCode",
*         message: "Invalid PostalCode"
*       }
*     ]
*  }
**/

store.dispatch({ type: "SET_NUMBER" });

/**
*  store.getState()
*  the output:
*  {
*     postalCode:123,
*     hoge: []
*  }
**/

```

See more detail [here](https://tkow.github.io/redux-state-validation/).

# Discussion and Future Planning

Though I recommend that watchRootReducer should set rootRedducer state, you can create error state at deeper located in nested state.Most case are enough at root only because dispatch methods are always synchronous unless odd acync actions breakes dispatch mutation rules (ordinaly you don't care mutch. the case does't happen if you use normally redux, async callbacks waits until process done if it is being executed ).

If you want to map error results to object record please computed feature because this library feature is shortage now. I may add transform structure options `adhocKey` ,has ability to contain some ui ids and to map to error results if I need it, may not so far day . If I make them,I think their data formats like followed by

```typescript
{
  ...otherStates,
  errors: {
    'text-input-1': [
      {
         id: "postalCode",
         message: "Invalid PostalCode"
      }
    ],
    'text-input-2': [
      {
         id: "phoneNumberNotDelimiter",
         message: "Invalid PhoneNumber: phoneNnumber needs 11 digits with hyphen"
      }
    ],
  }
}
```

but, these restructure from original array are possible by mapping object with computed props, if we transform as receiving errors soon.These data structure support needs ui-ids from an action ship them in payload or to add some properties like meta, I don't recommend to do so using redux in nomal way, the reason is they may break loosely-coupled structure and the reusability of reducers already implmented by additional arguments, and error messages are not necessarily in same place of input location .

# How You Contribute

Anyone welcome if you want to help or use it better.Please contact me or create issue freely.

# License

[MIT](https://github.com/tkow/redux-state-validation/blob/master/LICENSE)
