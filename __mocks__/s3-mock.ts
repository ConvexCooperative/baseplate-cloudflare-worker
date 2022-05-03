import { jest } from "@jest/globals";
export const sendMock = jest.fn();
export class S3Client {
  constructor() {
    this.send = sendMock;
  }
}
export class GetObjectCommand {}
