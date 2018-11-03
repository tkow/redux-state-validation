[![NPM](https://nodei.co/npm/redux-state-validation.png)](https://nodei.co/npm/redux-state-validation/)
[![npm version](https://badge.fury.io/js/redux-state-validation.svg)](https://badge.fury.io/js/redux-state-validation)
[![codecov](https://codecov.io/gh/tkow/redux-state-validation/branch/master/graph/badge.svg)](https://codecov.io/gh/tkow/redux-state-validation)
[![GitHub stars](https://img.shields.io/github/stars/tkow/redux-state-validation.svg?style=social&logo=github&label=Stars)](https://github.com/tkow/redux-state-validation)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Demo

[codesandbox](https://codesandbox.io/embed/82498npzv9)

<p align="center">
  <img src="https://raw.github.com/wiki/tkow/redux-state-validation/images/demo/rsv-example.gif" />
</p>

# Install

```
npm i --save redux-state-validation
```

stable versions are newer than 2.0.0.

# redux-state-validation

Add validator to reducer's result handy. Common validator have problem that depends on form or action thus, will be inclined to be weak by modification or increse redundant definitions.This library is simple to extend state array has arbitrary name (default:errors) with checking error and set the messages after each reducer's callback.

# Usage

## withValidateReducer(reducer:Reducer<State,action:Action>, validator:{id:string,validate(state:State): boolean}[]):Reducer(state:State,action:Action)

Type Parameter `Key` is corresponded to errorStateId's value in option which is second arguments of watchRootReducer. this API chains a reducer function to validation callback and if the result's not valid rollback state the previous one with save error object to internal state along configuration.

## watchRootReducer(reducer:Reducer<State,action:Action>,options?:{errorStateId?:string = 'errors',returnType?:string = 'object'}):Reducer(state:State&Record<Key, Error[]>,action:Action)

This API writes errors of validate methods to redux state, the depth can be arbitrary as how deep you apply watchRootReducer to selected reducer . This must call after all validate methods in the watchRootReducer applied to reducer's scope.This means we must not call watchRootReducer to get errors of parent's reducers or higher than them.This API must use to watch about child reducers or the reducer itself whether validation methods find errors, otherwise it is possible to start flushing errors to state though some validate method still aren't called  depends on the order of function invokes. Imagine the tree ,this derived one root node has many child nodes and decendants and depth-first search recuring process. Imagine one of these nodes is reducer,and the reducer executes fastest than the chirdlen and return last its'state. The callback set by watchRootReducer run after the reducer's return values, so the reducer can watch about all decendants and itself whether catch errors, therefore first origin node reducer is able to watch all of reducers it includes as decendants. So I highly recomend to control error states at top reducer.

## getInstance():{watchRootReducer,withValidateReducer}

getIncstance can recreate redux-state-validation instances have new self inner state apart from another. This is for you want to watch validating multi Reducers in some special reason like having reducers seperated store application, but I recommend that this don't as possible. I'll explain later at discussion.


The example is followed by


### object case(default)

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
*     hoge: {
*       "postalCode": {
*         id: "postalCode",
*         message: "Invalid PostalCode"
*       }
*     }
*  }
**/

store.dispatch({ type: "SET_NUMBER" });

/**
*  store.getState()
*  the output:
*  {
*     postalCode:123,
*     hoge: {}
*  }
**/

```

### array case

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
  errorStateId: "hoge", {
    returnType: 'array'
  }
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

# Discussion

Though I recommend that watchRootReducer should set rootRedducer state, you can create error state at deeper located in nested state.Most case are enough at root only because dispatch methods are always synchronous unless odd acync actions breakes dispatch mutation rules (ordinaly you don't care mutch. the case does't happen if you use normally redux, async callbacks waits until process done if it is being executed ).

# Tips

If you use redux, this library easily is able to be introduced in same reducers directory. Redux structures hav many valiation. Our redux structures.

```
redux/StateName/ - (sagas)
                 - actions
                 - reducers
                 - index
```

and export all of sets of redux layer from redux directory.
so we applied this layer to

```
redux/StateName/ - (sagas)
                 - actions
                 - reducers
                 - validators
                 - index
```

It helps us to make redux each state to be able to cast on and off however these application is so big. validators and reducers examples are like bellow (we use typescript so, this example written typescript)

```typescript
//validators.ts
//...
export const period: Validator<ProfileTypes.Episode['period'], PeriodValidatorId>[] = [
  {
    error: {
      id: 'Episode/period/',
      message: 'Internal: Invalid DateFormat'
    },
    validate: (value) => {
      let valid = moment(value.from, 'YYYY/MM').isValid()
      valid = moment(value.by, 'YYYY/MM').isValid() && valid
      return !!valid
    }
  }
]
```

```typescript
//reducers.ts
import * as validators from '.validators/'
//...
const period = withValidateReducer(
  handleActions(
    {
      [actionTypes.SET_PERIOD]: (state, { payload }: actionTypes.EpisodeActions['setPeriod']) => payload!,
    },
    initialState.period
  ),
  validators.period
)
```

This way is pretty in the point of that validators and reducers are not so tightly-coupled and , no-coupled actionCreator form and the other reducers.

we make the [snippets](https://gist.github.com/tkow/37379682d1b125aaccc03596d22b156f) reducers with handle actions of [redux-actions](https://github.com/redux-utilities/redux-actions).

# How You Contribute

Anyone welcome if you want to help or use it better.Please contact me or create issue freely.

# License

[MIT](https://github.com/tkow/redux-state-validation/blob/master/LICENSE)
