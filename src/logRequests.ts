import {
  TimestreamWriteClient,
  WriteRecordsCommand,
  _Record,
} from "@aws-sdk/client-timestream-write";
import { EnvVars } from "./main";

export async function logRequest(log: RequestLog, env: EnvVars): Promise<void> {
  if (log.skipLog) {
    return;
  }

  const timestreamClient = new TimestreamWriteClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const Dimensions: _Record["Dimensions"] = [
    {
      Name: "orgKey",
      Value: log.orgKey,
    },
    {
      Name: "requestPath",
      Value: log.requestPath,
    },
    {
      Name: "customerEnv",
      Value: log.customerEnv,
    },
    {
      Name: "microfrontendName",
      Value: log.microfrontendName,
    },
    {
      Name: "isImportMap",
      Value: log.isImportMap ? "true" : "false",
    },
  ].filter((d) => d.Value);

  const Records = [
    {
      Dimensions,
      MeasureName: "userAgent",
      MeasureValueType: "VARCHAR",
      MeasureValue: log.userAgent ?? "None",
      Time: log.timestamp.toString(),
    },
    {
      Dimensions,
      MeasureName: "httpStatus",
      MeasureValueType: "BIGINT",
      MeasureValue: String(log.httpStatus),
      Time: log.timestamp.toString(),
    },
  ];

  try {
    await timestreamClient.send(
      new WriteRecordsCommand({
        DatabaseName: env.TIMESTREAM_DATABASE,
        TableName: env.TIMESTREAM_TABLE,
        Records,
      })
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
    throw err;
  }
}

export interface RequestLog {
  timestamp: number;
  requestPath: string;
  customerEnv: string;
  userAgent: string | null;
  httpStatus: number;
  orgKey?: string;
  microfrontendName?: string;
  isImportMap?: boolean;
  skipLog?: boolean;
}
