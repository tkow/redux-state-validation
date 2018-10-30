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

but, these come possible by original array to map object with computed props calculates if we transform as receiving errors soon.These data structure support needs ui-ids from an action ship them in payload or some properties like meta, I don't recommend doing using redux in nomal way, the reason is they may break loosely-coupled structure and the reusability of reducers already existed by additional arguments and error messages are not in same place of input location necessarily.

# How Contributing

Anyone welcome if you want to help or use it better.

# License

[MIT](https://github.com/tkow/redux-state-validation/blob/master/LICENSE)
