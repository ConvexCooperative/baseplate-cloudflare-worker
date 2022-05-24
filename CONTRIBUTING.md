# About this project

This project is not open source. It is public, source-available code that may not be used for commercial purposes unless you receive a license from Convex Cooperative. See LICENSE for details.

## Running the code

You'll need a Cloudflare worker and some KV namespaces to set up. You can either get access to Convex's or create your own. The wrangler.toml controls this (More docs forthcoming)

After that, just run the following commands:

```sh
pnpm install

pnpm start
```

## Contributing

This project uses [Changesets](https://github.com/changesets/changesets) to manage its version. Every pull request requires that you create a changeset. To do this, run the following command:

```sh
pnpm exec changeset add
```

## Releasing new versions

This project is not published to npm, but still is semantically versioned for a few reasons:

1. The `Baseplate-Version` HTTP response header
1. We deploy to customer-facing environments only after creating Github Releases. This is enforced via Github workflows.

To release a new version:

1. Ensure `git status` is clean
1. `git checkout main && git pull`
1. `pnpm install`
1. `env GITHUB_TOKEN=<YOURGITHUBTOKEN> pnpm exec changeset version`
1. Review files and make any adjustments
1. `git add . && git commit -m "NEWVERSIONNUMBER"`
1. `git tag -a NEWVERSIONNUMBER -m NEWVERSIONNUMBER`
1. `git push --follow-tags`
1. Go to Github UI and create a Release for the newly created tag. You can copy/paste release notes from CHANGELOG.md.
1. Now in Github actions, you'll see a workflow for deploying the new tag to Test and Prod environments
