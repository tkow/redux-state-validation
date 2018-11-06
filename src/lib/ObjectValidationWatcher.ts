import {
  AbstractValidationWatcher,
  InternalParams,
  WithErrorOptions
} from "./AbstractValidationWather";
import { Error, ObjectResultValue } from "./types";

export class ObjectValidationWatcher extends AbstractValidationWatcher<
  "object"
> {
  protected internal: InternalParams<{
    [id: string]: Error | { [id: string]: Error };
  }>;

  constructor(internal = {}) {
    super();
    this.internal = {
      ...internal,
      results: {}
    };
  }

  public withError = <T, Action>(
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ): void => {
    if (validator.idSelecter) {
      const key = validator.idSelecter(error.id, action);
      if (!this.internal.results[key]) {
        this.internal.results[key] = {};
      }
      this.internal.results = {
        ...(this.internal.results as { [id: string]: { [id: string]: Error } }),
        [key]: {
          ...this.internal.results[key],
          [error.id]: error
        }
      };
    } else {
      this.internal.results = {
        ...(this.internal.results as ObjectResultValue),
        [error.id]: error
      };
    }
  };

  public nextErrors = (): ObjectResultValue => {
    const _result = Object.assign({}, this.internal.results);
    this.internal.results = {};
    return _result;
  };
}
