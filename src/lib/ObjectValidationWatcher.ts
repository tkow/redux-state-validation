import {
  AbstractValidationWatcher,
  Error,
  InternalParams,
  ResultValue
} from "./AbstractValidationWather";

// tslint:disable-next-line:max-classes-per-file
export class ObjectValidationWatcher extends AbstractValidationWatcher<
  "object"
> {
  protected internal: InternalParams<{ [id: string]: Error }>;

  constructor(internal = {}) {
    super();
    this.internal = {
      ...internal,
      results: {}
    };
  }

  public withError = (error: Error): void => {
    this.internal.results = {
      ...this.internal.results,
      [error.id]: error
    };
  };

  public nextErrors = (): ResultValue => {
    const _result = Object.assign({}, this.internal.results);
    this.internal.results = {};
    return _result;
  };
}
