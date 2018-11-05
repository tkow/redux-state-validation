import {
  AbstractValidationWatcher,
  Error,
  InternalParams,
  ResultValue
} from "./AbstractValidationWather";

// tslint:disable-next-line:max-classes-per-file
export class ArrayValidationWatcher extends AbstractValidationWatcher<"array"> {
  protected internal: InternalParams<Error[]>;

  constructor(internal = {}) {
    super();
    this.internal = {
      ...internal,
      results: []
    };
  }

  public withError = (error: Error): void => {
    this.internal.results = [...this.internal.results, error];
  };

  public nextErrors = (): ResultValue => {
    const _result = [...this.internal.results];
    this.internal.results = [];
    return _result;
  };
}
