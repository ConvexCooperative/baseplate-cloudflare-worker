const requiredEnvVariables = ["FOUNDRY_MFE_HOST"];

export function startupChecks() {
  requiredEnvVariables.forEach((envVarName) => {
    if (!self[envVarName]) {
      throw Error(
        `Environment variable '${envVarName}' is required, but not present.`
      );
    }
  });
}
