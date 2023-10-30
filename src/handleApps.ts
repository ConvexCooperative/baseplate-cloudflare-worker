import { corsHeaders } from "./cors";
import { baseplateVersion } from "./baseplateVersion";
import { OrgSettings, StaticFileProxySettings } from "@baseplate-sdk/utils";
import { getOrgSettings } from "./getOrgSettings";
import { notFoundResponse, internalErrorResponse } from "./responseUtils";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { RequestLog } from "./logRequests";
import { EnvVars } from "./main";

export async function handleApps(
  request: Request,
  params: Params,
  requestLog: RequestLog,
  env: EnvVars,
  orgKey?: string
): Promise<Response> {
  requestLog.microfrontendName = params.pathParts[0];

  if (!orgKey) {
    console.error(
      `No orgKey passed to handleApps function. Returning HTTP 500.`
    );
    return internalErrorResponse(request);
  }

  const orgSettings = await getOrgSettings(orgKey, env);

  if (!orgSettings.orgExists) {
    return notFoundResponse(request, orgSettings);
  }

  const requestUrl = new URL(request.url);

  const proxySettings = getMicrofrontendProxySettings(
    orgSettings,
    params.customerEnv
  );
  if (!proxySettings) {
    console.error(
      `No proxy settings found for org ${orgKey} and customerEnv ${params.customerEnv}`
    );
    return internalErrorResponse(request, orgSettings);
  }

  const proxyHost = proxySettings.host;

  if (!proxyHost) {
    console.error(
      `No proxy host found for org ${orgKey} and customerEnv ${params.customerEnv}`
    );
  }

  const proxyUrlStr =
    proxyHost + params.pathParts.join("/") + requestUrl.search;
  const proxyUrl = new URL(proxyUrlStr);
  let finalResponse;

  if (proxyUrl.protocol === "s3:") {
    const Bucket = proxyHost.replace("s3://", "");
    const Key = params.pathParts.join("/");

    const proxySettings =
      orgSettings.staticFiles.microfrontendProxy.environments[
        params.customerEnv
      ];

    const s3Client = new S3Client({
      region: proxySettings.useBaseplateHosting
        ? env.AWS_REGION
        : proxySettings.aws!.region,
      credentials: {
        accessKeyId: proxySettings.useBaseplateHosting
          ? env.AWS_ACCESS_KEY_ID
          : proxySettings.aws!.accessKeyId,
        secretAccessKey: proxySettings.useBaseplateHosting
          ? env.AWS_SECRET_ACCESS_KEY
          : proxySettings.aws!.secretAccessKey,
      },
    });
    let s3Response;
    try {
      s3Response = await s3Client.send(
        new GetObjectCommand({
          Bucket,
          Key,
        })
      );
    } catch (e) {
      if (e.Code === "NoSuchKey") {
        return notFoundResponse(request, orgSettings);
      } else {
        console.error(e);
        console.error(e.message);
        console.error(e.stack);
        return internalErrorResponse(request, orgSettings);
      }
    }

    const finalHeaders = {
      "content-type": s3Response.ContentType,
      etag: s3Response.ETag,
      "content-disposition": s3Response.ContentDisposition,
      "cache-control": s3Response.CacheControl,
      "content-encoding": s3Response.ContentEncoding,
      expires: s3Response.Expires,
      "last-modified": s3Response.LastModified,
    };
    // Not all s3 objects have every header
    // so we need to delete the ones that don't apply to this object
    for (let headerName in finalHeaders) {
      if (!finalHeaders[headerName]) {
        delete finalHeaders[headerName];
      }
    }

    finalResponse = new Response(s3Response.Body, { headers: finalHeaders });
  } else {
    const proxyRequest = new Request(proxyUrlStr, request);
    proxyRequest.headers.set("Origin", requestUrl.origin);
    const proxyResponse = await fetch(proxyRequest);

    finalResponse = new Response(proxyResponse.body, proxyResponse);
  }

  const additionalHeaders = {
    "cache-control": orgSettings.staticFiles.cacheControl,
    ...corsHeaders(request, orgSettings),
    ...baseplateVersion(),
  };
  for (let additionalHeader in additionalHeaders) {
    finalResponse.headers.set(
      additionalHeader,
      additionalHeaders[additionalHeader]
    );
  }

  return finalResponse;
}

function getMicrofrontendProxySettings(
  orgSettings: OrgSettings,
  customerEnv: string
): StaticFileProxySettings {
  return orgSettings.staticFiles.microfrontendProxy.environments[customerEnv];
}

interface Params {
  pathParts: string[];
  customerEnv: string;
}
