import { mergeDefaultOrgSettings, OrgSettings } from "@baseplate-sdk/utils";
import { EnvVars } from "./main";

export async function getOrgSettings(
  orgKey: string,
  env: EnvVars,
): Promise<OrgSettings> {
  let orgSettings: Partial<OrgSettings>;

  try {
    const maybeSettings = await env.MAIN_KV.get(`org-settings-${orgKey}`, {
      type: "json",
    });
    if (maybeSettings) {
      orgSettings = maybeSettings as Partial<OrgSettings>;
    } else {
      console.warn(`No settings found for organization ${orgKey}`);
      orgSettings = {};
    }
  } catch (err) {
    // Defensive programming here so that we don't take down their
    // production environment if their org settings are unavailable or invalid
    console.error(err);
    orgSettings = {};
  }

  const finalSettings: OrgSettings = mergeDefaultOrgSettings(orgSettings);

  return finalSettings;
}
