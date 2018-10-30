[![NPM](https://nodei.co/npm/redux-state-validation.png)](https://nodei.co/npm/redux-state-validation/)
[![npm version](https://badge.fury.io/js/redux-state-validation.svg)](https://badge.fury.io/js/redux-state-validation)
[![codecov](https://codecov.io/gh/tkow/redux-state-validation/branch/master/graph/badge.svg)](https://codecov.io/gh/tkow/redux-state-validation)
[![GitHub stars](https://img.shields.io/github/stars/tkow/redux-state-validation.svg?style=social&logo=github&label=Stars)](https://github.com/tkow/redux-state-validation)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


# redux-state-validation

Add validator to reducer's result handy. Common validator have problem that depends on form or action thus, will be inclined to be weak by modification or increse redundant definitions.This library is simple to extend state array has arbitrary name (default:errors) with checking error and set the messages after each reducer's callback.

# Usage


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
