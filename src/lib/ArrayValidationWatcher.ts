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
      results: []
    };
  }

  public withError = <T, Action>(
    error: Error,
    _withErrorOptions: WithErrorOptions<T, Action>
  ): void => {
    this.internal.results = this.getErrorResults(this.internal.results, error);
  };

  public nextErrors = (): ArrayResultValue => {
    const _result = [...this.internal.results];
    return _result;
  };

  public resetErrors = () => {
    this.internal.results = [];
  };

  public getErrorResults = (
    results: ArrayResultValue,
    error: Error
  ): ArrayResultValue => {
    const _result = [...results];
    const nextError: ArrayResultValue = [...(_result as Error[]), error];
    return nextError;
  };
}
