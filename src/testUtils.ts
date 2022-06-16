import { RequestLog } from "./logRequests";

export function sampleLog(): RequestLog {
  return {
    customerEnv: "prod",
    httpStatus: 200,
    requestPath: "/hi",
    timestamp: Date.now(),
    userAgent: "Chrome",
  };
}
