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
    return _result;
  };

  public resetErrors = () => {
    this.internal.results = {};
  };

  public getErrorResults = <T, Action>(
    results: ObjectResultValue,
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ): ObjectResultValue => {
    const _result = { ...results };
    let keys = validator.idSelector
      ? validator.idSelector(error.id, action)
      : error.id;
    if (typeof keys === "string") {
      keys = [keys];
    }
    const prevStateArray = this.getCompositeObjectArray(keys, _result);
    return this.mapIdToObject(keys, prevStateArray, error);
  };
}
