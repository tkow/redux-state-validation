[![NPM](https://nodei.co/npm/redux-state-validation.png)](https://nodei.co/npm/redux-state-validation/)
[![npm version](https://badge.fury.io/js/redux-state-validation.svg)](https://badge.fury.io/js/redux-state-validation)
[![codecov](https://codecov.io/gh/tkow/redux-state-validation/branch/master/graph/badge.svg)](https://codecov.io/gh/tkow/redux-state-validation)
[![GitHub stars](https://img.shields.io/github/stars/tkow/redux-state-validation.svg?style=social&logo=github&label=Stars)](https://github.com/tkow/redux-state-validation)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Why redux-state-validation ?

Add validator to reducer's result handy. Common validator have problem that depends on form or action thus, will be inclined to be weak by modification or increse redundant definitions.This library is simple to extend state array has arbitrary name (default:errors) with checking error and set the messages after each reducer's callback.

This library for react-native rather than react, but we aim to seemless reuse redux state loosely-coupled each applications with react-native and web.

# Demo

[codesandbox](https://codesandbox.io/embed/k2nr45onwr?fontsize=14)

<p align="center">
  <img src="https://raw.github.com/wiki/tkow/redux-state-validation/images/demo/rsv-example.gif" />
</p>

# Install

```
npm i --save redux-state-validation
```

we broke compatibility completely from version 7.0.0.
If you want to use older versions, stable versions equals or newer than 6.0.0.

# Usage

```typescript
import {
  combineErrorsReducers,
  createMiddleware,
  createValidateReducer
} from "redux-state-validation";

const exampleReducer = (
  state: string = "foo",
  action: { type: string; value: string }
) => {
  if(action.type === 'EXAMPLE')
    return action && action.value ? action.value : state;
};

const foo = createValidateReducer(
  exampleReducer,
  [
    {
      error: {
        id: "invalid-state-foo",
        message: "Invalid State"
      },
      validate: _state => {
        return _state !== 'foo'
      }
    }
  ],
  { returnType: "object" }
);

const store = createStore(
  combineReducers({
    foo: foo
    errors: combineErrorsReducers({
      foo
    })
    // or explicitly
    // errors: combineReducers({
    //  foo: foo.validateReducer
    // })
    // you can compose foo.validateReducer as you like
  }),
  {
    errors: {},
    foo: 'foo'
  },
  applyMiddleware(createMiddleware())
);

store.dispatch({
  type: 'Example',
  value: 'bar'
})

const errors = store.getState().errors
console.log(JSON.stringify(errors, null, 2))

/**
 * {
 *   "foo": {
 *     "invalid-state-foo": {
 *       "id": "invalid-state-foo",
 *       "mesage": "Invalid State"
 *     }
 *   }
 * }
 */

```

# How You Contribute

Anyone welcome if you want to help or use it better.Please contact me or create issue freely.

# License

[MIT](https://github.com/tkow/redux-state-validation/blob/master/LICENSE)
