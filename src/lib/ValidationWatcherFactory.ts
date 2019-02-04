import { AbstractValidationWatcher } from "./AbstractValidationWatcher";
import { ArrayValidationWatcher } from "./ArrayValidationWatcher";
import { ObjectValidationWatcher } from "./ObjectValidationWatcher";
import {
  ArrayResultValue,
  ObjectResultValue,
  ReduxAction,
  ResultValue,
  Validator
} from "./types";

type ReturnType = "object" | "array";

export interface Config<T extends string, R extends ReturnType> {
  errorStateId?: T;
  returnType?: R;
}

export interface Reducer<State extends {}, Action extends ReduxAction> {
  (state: State, action: Action): State;
}

const defaultConfig = {
  errorStateId: "errors",
  returnType: "array"
};

function partition(array, isValid) {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []]
  );
}

type WithValidatorState<State, Key extends string, ReturnType> = State &
  Record<
    Key,
    ReturnType extends "object" ? ObjectResultValue : ArrayResultValue
  >;

function isObjectValidatorWatcher(
  _: AbstractValidationWatcher<"object" | "array">,
  type: string
): _ is ObjectValidationWatcher {
  return type === "object";
}

export class ValidationWatcherFactory {
  protected actionTypes = {
    SET_VALIDATIONS: "@@REDUX_STATE_VALIDATION/SET_VALIDATIONS"
  };
  private _validationWatcher: AbstractValidationWatcher<"object" | "array">;
  private _initialized: boolean = false;
  public withValidateReducer = <T, Action extends ReduxAction>(
    reducer: (state: T, action: Action) => T,
    validators: Array<Validator<T, Action>>
  ): typeof reducer => {
    const [beforeReduceValidators, afterReduceValidators] = partition(
      validators,
      validator => validator.validate.length > 1 && !validator.afterReduce
    );
    return (prev: T, action: Action) => {
      if (
        this._initialized &&
        this.isInvalid(beforeReduceValidators, {
          action,
          prev
        })
      ) {
        return prev;
      }
      const next = reducer(prev, action);
      if (
        this._initialized &&
        this.isInvalid(afterReduceValidators, {
          action,
          next,
          prev
        })
      ) {
        return prev;
      } else {
        return next;
      }
    };
  };

  public createStaticValidator = <T, Action extends ReduxAction>(
    validators: { [stateName in keyof T]: Array<Validator<T, Action>> }
  ) => {
    return (value: T) => {
      const stateValidationResults = Object.keys(validators).reduce(
        (current, key, _index) => {
          const result = validators[key].reduce((_result, _validator) => {
            const invalid =
              !_validator.validate(value[key], {}) && value[key] !== undefined;
            if (invalid) {
              return this._validationWatcher.getErrorResults(
                _result,
                _validator.error,
                {
                  validator: _validator
                }
              );
            }
            return _result;
          }, {});
          if (Object.keys(result).length > 0) {
            return {
              ...current,
              ...result
            };
          }
          return current;
        },
        {}
      );
      return this.setValidatorResults(stateValidationResults);
    };
  };

  public setValidatorResults = (errors: ResultValue) => {
    return {
      payload: errors,
      type: this.actionTypes.SET_VALIDATIONS
    };
  };

  public watchRootReducer = <
    State extends {},
    Action extends ReduxAction,
    Key extends string = "errors",
    TReturnType extends ReturnType = "array"
  >(
    reducer: Reducer<State, Action>,
    config: Config<Key, TReturnType> = {}
  ): Reducer<WithValidatorState<State, Key, TReturnType>, Action> => {
    const { errorStateId, returnType }: Required<Config<Key, TReturnType>> = {
      ...defaultConfig,
      ...config
    } as Required<Config<Key, TReturnType>>;
    this.setWatcherInstance(returnType);
    this._initialized = true;
    return (state, action) => {
      if (state && errorStateId in state) {
        delete state[errorStateId];
      }
      const nextState = reducer(state, action);
      const _nextErrors = (_state, action) => {
        switch (action.type) {
          case this.actionTypes.SET_VALIDATIONS:
            return action.payload;
          default:
            return this._validationWatcher.nextErrors();
        }
      };
      return {
        ...(nextState as object),
        [errorStateId]: _nextErrors(state, action)
      } as State & WithValidatorState<State, Key, TReturnType>;
    };
  };

  protected isInvalid = <T, Action extends ReduxAction>(
    validators: Array<Validator<T, Action>>,
    {
      prev,
      next = prev,
      action
    }: {
      prev: T;
      next?: T;
      action: Action;
    }
  ) => {
    return validators
      .map(validator => {
        const invalid = !validator.validate(next, action) && prev !== undefined;
        if (invalid) {
          this._validationWatcher.withError(validator.error, {
            action,
            validator
          });
        }
        return invalid && validator.strict;
      })
      .some(result => result);
  };

  private setWatcherInstance = <T extends "array" | "object">(type: T) => {
    if (isObjectValidatorWatcher(this._validationWatcher, type)) {
      this._validationWatcher = new ObjectValidationWatcher();
    } else {
      this._validationWatcher = new ArrayValidationWatcher();
    }
    return this._validationWatcher;
  };
}
