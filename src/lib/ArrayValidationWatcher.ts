import {
  AbstractValidationWatcher,
  InternalParams,
  WithErrorOptions
} from "./AbstractValidationWatcher";
import { ArrayResultValue, Error } from "./types";

export class ArrayValidationWatcher extends AbstractValidationWatcher<"array"> {
  protected internal: InternalParams<ArrayResultValue>;

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

  public nextErrors = (): ArrayResultValue => {
    const _result = Object.assign({}, this.internal.results);
    this.internal.results = {};
    return _result;
  };

  public getErrorResults = <T, Action>(
    results: ArrayResultValue,
    error: Error,
    { validator, action }: WithErrorOptions<T, Action>
  ): ArrayResultValue => {
    const _result = { ...results };
    let keys = validator.idSelector
      ? validator.idSelector(error.id, action)
      : error.id;
    if (typeof keys === "string") {
      keys = [keys];
    }
    const prevStateArray = this.getCompositeObjectArray([...keys], _result);
    const margedArray = prevStateArray[prevStateArray.length - 1].length
      ? prevStateArray.pop()
      : ([] as Error[]);
    return this.mapIdToObject(keys, prevStateArray, [...margedArray, error]);
  };
}
