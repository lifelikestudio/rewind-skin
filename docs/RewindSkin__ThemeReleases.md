# Shopify theme release workflow

This workflow keeps the published theme's editor-managed content and app embed
state while deploying code from this repository.

## File ownership

Code-owned files are deployed from Git:

- Liquid layouts, sections, snippets, and blocks
- JavaScript, CSS, images, and other assets
- Theme setting schemas and locales

Merchant-owned files are copied from the published theme and protected during a
normal release:

- `config/settings_data.json`
- `templates/*.json`
- `templates/customers/*.json`
- `sections/*.json`

App embed activation is stored in `config/settings_data.json`. Never overwrite
that file during a normal production release.

## Authentication

The tracked `shopify.theme.toml` must not contain Theme Access passwords.
Authenticate with a Shopify account when prompted, or expose a Theme Access
password only in the current shell:

```sh
export SHOPIFY_CLI_THEME_TOKEN="..."
```

Never commit the token. Rotate a token immediately if it is exposed.

## Development

Start development against a specific unpublished theme on the live store:

```sh
npm run theme:dev -- --theme <theme-id-or-name>
```

This enables `--theme-editor-sync`, so JSON changes made in the development
theme editor are synchronized back to the local theme. Review and commit only
intentional changes.

## Normal production release

1. Finish the implementation, builds, and checks. Commit or otherwise preserve
   all local work.
2. Ask anyone using the theme editor to pause changes for the release window.
3. In Shopify Admin, duplicate the currently published theme. Use this duplicate
   as the release candidate. It contains the latest editor settings, template
   composition, section groups, and app embed state.
4. Copy the duplicate's theme ID or exact name.
5. Build the production assets:

   ```sh
   npm run build
   ```

6. Push code through the guarded release environment:

   ```sh
   npm run theme:release -- --theme <theme-id-or-name>
   ```

   The release environment also uses `nodelete`, so remote-only theme files are
   retained.

7. Preview the release candidate. Verify:
   - Theme settings and custom CSS
   - App embeds under **Theme settings > App embeds**
   - Header, footer, navigation, and key templates
   - Search, cart, analytics, and consent integrations
8. Publish the release candidate.
9. Keep the previously published theme as the immediate rollback target.

Do not use an unguarded full `shopify theme push` against the release candidate
or published theme.

## Intentional JSON changes

JSON files can contain both deployable structure and merchant-managed content.
When a release intentionally adds or changes a JSON template or section group,
merge that one file explicitly:

1. Ensure the intended local version is committed.
2. Pull the release candidate's current version into the working tree:

   ```sh
   shopify theme pull \
     --environment live \
     --theme <theme-id-or-name> \
     --only "templates/example.json"
   ```

3. Merge the intended structural change from Git into the pulled file while
   retaining the release candidate's settings and section content.
4. Review the complete diff.
5. Push only the reviewed file through the non-ignored environment:

   ```sh
   shopify theme push \
     --environment live \
     --theme <theme-id-or-name> \
     --only "templates/example.json"
   ```

Use the same process for an exact `sections/*.json` section-group file or a new
JSON template. Never disable all release safeguards to move one JSON change.

## Release timing

The duplicate is a snapshot. Theme-editor changes made on the published theme
after duplication are not copied automatically. Keep the release window short;
if an editor change occurs, repeat the duplication or reproduce that change on
the release candidate before publishing.
