# Baseplate KV Keys

Below is the list of keys that is expected in any environment.

## org-settings-{orgName}

**Example**: org-settings-walmart

This is required.

```json
{ "orgExists": true }
```

## import-map-{orgName}-{customerEnv}-{importMapName}

**Example**: import-map-walmart-stage-systemjs

This is required.

`customerEnv` defaults to `prod`.

```json
{
  "imports": { "react": "https://cdn.baseplate.cloud/react.js" },
  "scopes": {}
}
```
