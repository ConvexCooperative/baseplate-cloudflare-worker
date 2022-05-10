const requiredEnvVariables = ["BASEPLATE_ENV"];

export function startupChecks() {
  requiredEnvVariables.forEach((envVarName) => {
    if (!self[envVarName]) {
      throw Error(
        `Environment variable '${envVarName}' is required, but not present.`
      );
    }
  });
}
