import {
  AbstractValidationWatcher,
  InternalParams,
  WithErrorOptions
} from "./AbstractValidationWatcher";
import { Error, ObjectResultValue } from "./types";

export class ObjectValidationWatcher extends AbstractValidationWatcher<
  "object"
> {
  protected internal: InternalParams<ObjectResultValue>;

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
    const _result = { ...results };
    if (validator.idSelector) {
      let keys = validator.idSelector(error.id, action);
      if(typeof keys === 'string') {
        keys = [keys]
      }
      return this.mapIdToObject(
        keys,  {[error.id]: error}
      );
    } else {
      return {
        ...(_result as ObjectResultValue),
        [error.id]: error
      };
    }
  };
}
