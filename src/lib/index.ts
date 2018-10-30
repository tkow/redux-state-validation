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

export let _intenal: IntenalParams<string> = {
  errorStateId: "error",
  results: []
};

export function watchRootReducer<
  State extends {},
  Action,
  Key extends string = "error"
>(
  reducer: Reducer<State, Action>,
  config: Config<Key> = {}
): Reducer<State & Record<Key, Error[]>, Action> {
  const { errorStateId } = config;
  if (errorStateId) {
    _intenal.errorStateId = errorStateId;
  }
  return (state, action) => {
    const nextState = reducer(state, action);
    const nextErrors = _intenal.results.slice();
    _intenal.results = [];
    return {
      ...(nextState as object),
      [_intenal.errorStateId]: nextErrors
    } as State & Record<Key, Error[]>;
  };
}

export function withValidateReducer<T, Action>(
  reducer: (state: T, action: Action) => T,
  validators: Array<Validator<T>>
): typeof reducer {
  return (prev: T, action: Action) => {
    const next = reducer(prev, action);
    if (
      validators.some(validator => {
        const invalid = !validator.validate(next);
        if (invalid) {
          withError(validator.error);
        }
        return invalid;
      })
    ) {
      return prev;
    } else {
      return next;
    }
  };
}

function withError(error: Error): void {
  _intenal.results.push(error);
}
