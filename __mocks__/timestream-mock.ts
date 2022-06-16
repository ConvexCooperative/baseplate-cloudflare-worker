import { jest } from "@jest/globals";

export class TimestreamWriteClient {
  send: Function;
  constructor(opts: any) {
    this.send = jest.fn();
  }
}

export class WriteRecordsCommand {
  constructor(opts: any) {}
}
