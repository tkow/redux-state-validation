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
    withErrorOptions: WithErrorOptions<T, Action>
  ): void => {
    this.internal.results = this.getErrorResults(
      this.internal.results,
      error,
      withErrorOptions
    );
  };

  public nextErrors = (): ObjectResultValue => {
    const _result = Object.assign({}, this.internal.results);
    this.internal.results = {};
    return _result;
  };

  public getErrorResults = <T, Action>(
    results: ObjectResultValue,
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ): ObjectResultValue => {
    let _result = { ...results };
    if (validator.idSelector) {
      const key = validator.idSelector(error.id, action);
      if (!_result[key]) {
        _result[key] = {};
      }
      return {
        ...(_result as { [id: string]: { [id: string]: Error } }),
        [key]: {
          ..._result[key],
          [error.id]: error
        }
      };
    } else {
      return (_result = {
        ...(_result as ObjectResultValue),
        [error.id]: error
      });
    }
  };
}
