import { AbstractValidationWatcher } from "./AbstractValidationWatcher";
import { ArrayValidationWatcher } from "./ArrayValidationWatcher";
import { actionTypes } from "./MiddleWare";
import { ObjectValidationWatcher } from "./ObjectValidationWatcher";
import {
  ArrayResultValue,
  ObjectResultValue,
  ReduxAction,
  Validator
} from "./types";

type ErrorsType = "object" | "array";

export interface Config<R extends ErrorsType> {
  returnType?: R;
}

export interface Reducer<State extends {}, Action extends ReduxAction> {
  (state: State, action: Action): State;
}

function partition(array, isValid) {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []]
  );
}

type WithValidatorState<ErrorsType> = ErrorsType extends "object"
  ? ObjectResultValue
  : ArrayResultValue;

function isObjectValidatorWatcher(
  _: AbstractValidationWatcher<"object" | "array">,
  type: string
): _ is ObjectValidationWatcher {
  return type === "object";
}

const DEFAULT_CONFIG = {
  returnType: "array"
} as const;

class ValidationWatcherFactory {
  private _validationWatcher: AbstractValidationWatcher<"object" | "array">;
  private _initialized: boolean = false;

  public withValidateReducer = <
    T,
    Action extends ReduxAction,
    TErrorsType extends ErrorsType = "array"
  >(
    reducer: (state: T, action: Action) => T,
    validators: Array<Validator<T, Action>>,
    config: Config<TErrorsType>
  ): typeof reducer & {
    validateReducer: Reducer<WithValidatorState<TErrorsType>, Action>;
  } => {
    const [beforeReduceValidators, afterReduceValidators] = partition(
      validators,
      validator => validator.validate.length > 1 && !validator.afterReduce
    );
    const exReducer = (prev: T, action: Action) => {
      if (action.type === actionTypes.SET_VALIDATIONS) {
        return prev;
      }
      this._validationWatcher.resetErrors();
      if (
        this._initialized &&
        this.validateAndRejectStateSet(beforeReduceValidators, {
          action,
          prev
        })
      ) {
        return prev;
      }
      const next = reducer(prev, action);
      if (
        this._initialized &&
        this.validateAndRejectStateSet(afterReduceValidators, {
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
    exReducer.validateReducer = this.watchErrorsReducer(config);
    return exReducer;
  };

  protected validateAndRejectStateSet = <T, Action extends ReduxAction>(
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

  private watchErrorsReducer = <
    Action extends ReduxAction,
    TErrorsType extends ErrorsType = "array"
  >(
    config: Config<TErrorsType>
  ): Reducer<WithValidatorState<TErrorsType>, Action> => {
    const { returnType }: Required<Config<TErrorsType>> = config as Required<
      Config<TErrorsType>
    >;
    this.setWatcherInstance(returnType);
    this._initialized = true;
    return (
      _state: WithValidatorState<TErrorsType> = {} as WithValidatorState<
        TErrorsType
      >,
      action: Action
    ): WithValidatorState<TErrorsType> => {
      switch (action.type) {
        case actionTypes.SET_VALIDATIONS:
          return this._validationWatcher.nextErrors() as WithValidatorState<
            TErrorsType
          >;
        default:
          return _state;
      }
    };
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

export const createValidateReducer = <
  T,
  Action extends ReduxAction,
  TErrorsType extends ErrorsType = "array"
>(
  reducer: (state: T, action: Action) => T,
  validators: Array<Validator<T, Action>>,
  config: Config<TErrorsType> = DEFAULT_CONFIG as Config<TErrorsType>
) => {
  const vwf = new ValidationWatcherFactory();
  return vwf.withValidateReducer(reducer, validators, config);
};
