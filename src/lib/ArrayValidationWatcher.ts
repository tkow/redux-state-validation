import {
  AbstractValidationWatcher,
  InternalParams,
  WithErrorOptions
} from "./AbstractValidationWather";
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
    { validator, action }: WithErrorOptions<T, Action>
  ): void => {
    const key = validator.idSelecter
      ? validator.idSelecter(error.id, action)
      : error.id;
    if (!this.internal.results[key]) {
      this.internal.results[key] = [];
    }
    this.internal.results = {
      ...this.internal.results,
      [key]: [...(this.internal.results[key] as Error[]), error]
    };
  };

  public nextErrors = (): ArrayResultValue => {
    const _result = Object.assign({}, this.internal.results);
    this.internal.results = {};
    return _result;
  };
}
