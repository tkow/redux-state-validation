export interface Error {
  id: string;
  message: string;
}

export interface Validator<T> {
  error: Error;
  validate(state: T): boolean;
}

type ReturnType = "object" | "array";

type ResultValue = Error[] | { [id: string]: Error };

interface Config<T extends string, R extends ReturnType> {
  errorStateId?: T;
  returnType?: R;
}

interface IntenalParams<T extends ResultValue> {
  results: T;
}

interface Reducer<State extends {}, Action> {
  (state: State, action: Action): State;
}

const defaultConfig = {
  errorStateId: "errors",
  returnType: "object"
};

type WithValidatorState<State, Key extends string, ReturnType> = State &
  Record<Key, ReturnType extends "object" ? { [id: string]: Error } : Error[]>;

class ValidationWatcher {
  public get watchRootReducer() {
    return this._watchRootReducer;
  }

  private internal: IntenalParams<ResultValue>;

  constructor(internal = {}) {
    this.internal = {
      results: [],
      ...internal
    };
  }

  private _withValidateReducer = <T, Action>(
    reducer: (state: T, action: Action) => T,
    validators: Array<Validator<T>>
  ): typeof reducer => {
    return (prev: T, action: Action) => {
      const next = reducer(prev, action);
      if (
        validators.some(validator => {
          const invalid = !validator.validate(next) && prev !== undefined;
          if (invalid) {
            this.withError(validator.error);
          }
          return invalid;
        })
      ) {
        return prev;
      } else {
        return next;
      }
    };
  };

  public get withValidateReducer() {
    return this._withValidateReducer;
  }

  private _watchRootReducer = <
    State extends {},
    Action,
    Key extends string = "errors",
    TReturnType extends ReturnType = "object"
  >(
    reducer: Reducer<State, Action>,
    config: Config<Key, TReturnType> = {}
  ): Reducer<WithValidatorState<State, Key, TReturnType>, Action> => {
    const { errorStateId, returnType }: { [id: string]: string } = {
      ...defaultConfig,
      ...config
    };
    if (returnType === "object") {
      this.internal.results = {};
    } else {
      this.internal.results = [];
    }
    return (state, action) => {
      if (state && errorStateId in state) {
        delete state[errorStateId];
      }
      const nextState = reducer(state, action);
      const _nextErrors = this.nextErrors();
      return {
        ...(nextState as object),
        [errorStateId]: _nextErrors
      } as State & WithValidatorState<State, Key, TReturnType>;
    };
  };

  private withError = (error: Error): void => {
    if (isResultsObject(this.internal.results)) {
      this.internal.results = {
        ...this.internal.results,
        [error.id]: error
      };
    } else {
      this.internal.results = [...this.internal.results, error];
    }
  };

  private nextErrors = (): ResultValue => {
    if (isResultsObject(this.internal.results)) {
      const _result = Object.assign({}, this.internal.results);
      this.internal.results = {};
      return _result;
    }
    const _result = [...this.internal.results];
    this.internal.results = [];
    return _result;
  };
}

function isResultsObject(results): results is { [id: string]: Error } {
  if (Array.isArray(results)) {
    return false;
  }
  return true;
}

export function getInstance() {
  const { watchRootReducer, withValidateReducer } = new ValidationWatcher();
  return {
    watchRootReducer,
    withValidateReducer
  };
}

export const { withValidateReducer, watchRootReducer } = getInstance();
