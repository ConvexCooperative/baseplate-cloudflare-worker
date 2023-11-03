import { EnvVars } from "./main";

export async function getOrgKeyFromHostname(hostname: string, env: EnvVars) {
  return env.MAIN_KV.get(`custom-domain-${hostname}`, {
    type: "text",
  });
}
