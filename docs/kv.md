# Foundry KV Keys

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

`customerEnv` defaults to `__main__`.

```json
{
  "imports": { "react": "https://cdn.single-spa-foundry.com/react.js" },
  "scopes": {}
}
```
