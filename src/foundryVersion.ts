import packageJson from "../package.json";
export function foundryVersion() {
  return { "Foundry-Version": packageJson.version };
}
