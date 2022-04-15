import packageJson from "../package.json";
export function baseplateVersion() {
  return { "Baseplate-Version": packageJson.version };
}
