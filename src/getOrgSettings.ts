import { merge } from "lodash-es";

const defaultSettings: OrgSettings = {
  importMapCacheControl: "public, must-revalidate, max-age=60",
  cors: {
    allowOrigins: ["*"],
    exposeHeaders: [],
    // 1 day in seconds
    maxAge: 86400,
    allowCredentials: true,
    allowHeaders: [],
    allowMethods: ["GET", "HEAD", "OPTIONS"],
  },
  orgExists: false,
};

export async function getOrgSettings(orgKey: string): Promise<OrgSettings> {
  let orgSettings: Partial<OrgSettings>;

  try {
    const maybeSettings = await MAIN_KV.get(`org-settings-${orgKey}`, {
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

  const finalSettings: OrgSettings = merge({}, defaultSettings, orgSettings);

  return finalSettings;
}

export interface OrgSettings {
  importMapCacheControl: string;
  cors: CORSSettings;
  orgExists: boolean;
}

export interface CORSSettings {
  allowOrigins: string[];
  exposeHeaders: string[];
  maxAge: number;
  allowCredentials: boolean;
  allowMethods: string[];
  allowHeaders: string[];
}
