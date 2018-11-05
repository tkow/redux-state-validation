import { AbstractValidationWatcher } from "./AbstractValidationWather";
import { ArrayValidationWatcher } from "./ArrayValidationWatcher";
import { ObjectValidationWatcher } from "./ObjectValidationWatcher";
export interface Error {
  id: string;
  message: string;
}

export interface Validator<T, Action = any> {
  error: Error;
  afterReduce?: boolean;
  idSelecter?(id: number, action: Action): number;
  idSelecter?(id: string, action: Action): string;
  validate(state: T, action?: Action): boolean;
}

export type ReturnType = "object" | "array";

export type ResultValue = Error[] | { [id: string]: Error };

export interface Config<T extends string, R extends ReturnType> {
  errorStateId?: T;
  returnType?: R;
}

export interface InternalParams<T extends ResultValue> {
  results: T;
}

export interface Reducer<State extends {}, Action> {
  (state: State, action: Action): State;
}

export const defaultConfig = {
  errorStateId: "errors",
  returnType: "object"
};

export function partition(array, isValid) {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []]
  );
}

export type WithValidatorState<State, Key extends string, ReturnType> = State &
  Record<Key, ReturnType extends "object" ? { [id: string]: Error } : Error[]>;

function isObjectValidatorWatcher(
  _: AbstractValidationWatcher<"object" | "array">,
  type: string
): _ is ObjectValidationWatcher {
  return type === "object";
}

export class ValidationWatcherFactory {
  private _validationWatcher: AbstractValidationWatcher<"object" | "array">;

  public withValidateReducer = <T, Action>(
    reducer: (state: T, action: Action) => T,
    validators: Array<Validator<T, Action>>
  ): typeof reducer => {
    return (prev: T, action: Action) => {
      const [beforeReduceValidators, afterReduceValidators] = partition(
        validators,
        validator => validator.validate.length > 1 && !validator.afterReduce
      );
      if (
        this.isInvalid(beforeReduceValidators, {
          action,
          prev
        })
      ) {
        return prev;
      }
      const next = reducer(prev, action);
      if (
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

  public watchRootReducer = <
    State extends {},
    Action,
    Key extends string = "errors",
    TReturnType extends ReturnType = "object"
  >(
    reducer: Reducer<State, Action>,
    config: Config<Key, TReturnType> = {}
  ): Reducer<WithValidatorState<State, Key, TReturnType>, Action> => {
    const { errorStateId, returnType }: Required<Config<Key, TReturnType>> = {
      ...defaultConfig,
      ...config
    } as Required<Config<Key, TReturnType>>;
    this.setWatcherInstance(returnType);
    return (state, action) => {
      if (state && errorStateId in state) {
        delete state[errorStateId];
      }
      const nextState = reducer(state, action);
      const _nextErrors = this._validationWatcher.nextErrors();
      return {
        ...(nextState as object),
        [errorStateId]: _nextErrors
      } as State & WithValidatorState<State, Key, TReturnType>;
    };
  };

  protected isInvalid = <T, A>(
    validators: Array<Validator<T, A>>,
    {
      prev,
      next = prev,
      action
    }: {
      prev: T;
      next?: T;
      action: A;
    }
  ) => {
    return validators
      .map(validator => {
        const invalid = !validator.validate(next, action) && prev !== undefined;
        if (invalid) {
          this._validationWatcher.withError(validator.error);
        }
        return invalid;
      })
      .some(result => result);
  };

  private setWatcherInstance<T extends "array" | "object">(type: T) {
    if (isObjectValidatorWatcher(this._validationWatcher, type)) {
      this._validationWatcher = new ObjectValidationWatcher();
    } else {
      this._validationWatcher = new ArrayValidationWatcher();
    }
    return this._validationWatcher;
  }
}