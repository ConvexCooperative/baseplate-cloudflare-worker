import { EnvVars } from "./main";

export async function getOrgKey(origin: string, env: EnvVars) {
  return env.MAIN_KV.get(`custom-domain-${origin}`, {
    type: "text",
  });
}
