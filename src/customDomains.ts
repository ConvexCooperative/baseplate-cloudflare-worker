import { EnvVars } from "./main";

export async function getOrgKeyFromHostname(hostname: string, env: EnvVars) {
  return env.MAIN_KV.get(`custom-domain-${hostname}`, {
    type: "text",
  });
}

export function isCustomDomain(hostname: string) {
  return (
    !hostname.endsWith(".baseplate.cloud") &&
    !["localhost", "127.0.0.1", "0.0.0.0", "192.168.1.246"].includes(hostname)
  );
}
