interface Error {
  id: string;
  message: string;
}

interface Validator<T> {
  error: Error;
  validate(state: T): boolean;
}

interface Config<T extends string> {
  errorStateId?: T;
}
interface IntenalParams<T extends string> extends Config<T> {
  results: Error[];
}

interface Reducer<State extends {}, Action> {
  (state: State, action: Action): State;
}

class ValidationWatcher {
  public get watchRootReducer() {
    return this._watchRootReducer;
  }

  private internal: IntenalParams<string>;

  constructor(state = {}) {
    this.internal = {
      errorStateId: "errors",
      results: [],
      ...state
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
          const invalid = !validator.validate(next);
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
    Key extends string = "errors"
  >(
    reducer: Reducer<State, Action>,
    config: Config<Key> = {}
  ): Reducer<State & Record<Key, Error[]>, Action> => {
    const { errorStateId } = config;
    if (errorStateId) {
      this.internal.errorStateId = errorStateId;
    }
    return (state, action) => {
      if (state && errorStateId in state) {
        delete state[errorStateId];
      }
      const nextState = reducer(state, action);
      const nextErrors = this.internal.results.slice();
      this.internal.results = [];
      return {
        ...(nextState as object),
        [this.internal.errorStateId]: nextErrors
      } as State & Record<Key, Error[]>;
    };
  };

  private withError(error: Error): void {
    this.internal.results.push(error);
  }
}

export function getInstance() {
  const { watchRootReducer, withValidateReducer } = new ValidationWatcher();
  return {
    watchRootReducer,
    withValidateReducer
  };
}

export const { withValidateReducer, watchRootReducer } = getInstance();
