# baseplate-cloudflare-worker

## Local Development

### One-time setup

1. Ask for an invite to the Baseplate cloudflare worker. Accept the invite, create a Cloudflare account.
1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update) globally `npm i @cloudflare/wrangler -g`
1. `wrangler login`
1. Clone the github repo
1. Set up [Local env vars](#local-env-vars)

### Each time

1. `pnpm install` (only necessary after a git pull that changed package.json or pnpm-lock.yaml)
1. `pnpm start`

Now you can go to http://localhost:8787/walmart/systemjs.importmap and see an import map in the browser

### Local env vars

Copy the `.dev.vars.example` file to `.dev.vars`, then fill in the environment variable values. Some of the values can be retrieved by running `terraform output -json` and looking for the following values:

- `AWS_REGION`
- `dev_cf_AWS_ACCESS_KEY_ID`
- `dev_cf_AWS_SECRET_ACCESS_KEY`
- `dev_cf_TIMESTREAM_DATABASE`
- `dev_cf_TIMESTREAM_TABLE`

### Database / KV Storage

All local development is done against the same Cloudflare KV Storage, which acts as our database. The KV Storage is shared between all developers, which means that we can accidentally break things for each other by modifying it. To avoid issues, each developer should create their own customer/organization and develop against that, so that if they break things it's only for themself rather than for everyone.

To create an organization, or to sync an existing organization to have correct data, run the following command (replace `walmart` with name of your organization):

```sh
# In windows, try this with powershell or adjust the back slashes for forward slashes if using Command Prompt
bash ./scripts/sync-org.sh walmart
```
