# Maintainer operations

## Initial publication

The local project is prepared for the public repository. Check the remote you configured before publishing:

```sh
git remote -v
git push -u proof-of-cipher-paper-proximus main
git push proof-of-cipher-paper-proximus v2.0.0
```

These commands use the remote name configured in the original local checkout. Use your own remote name in another clone. The initial annotated tag identifies the reviewed edition. Do not move a released tag. Create a new patch version for subsequent changes.

## Enable review controls

These files are configuration templates. Local files alone do not enable GitHub protections. After the first push and successful `paper-checks` workflow, an authenticated repository administrator can apply them:

```sh
gh api --method PUT repos/PROXIMUS-RESEARCH-LABS-FOUNDATION/proof-of-cipher-paper/branches/main/protection --input .github/branch-protection.json
gh api --method POST repos/PROXIMUS-RESEARCH-LABS-FOUNDATION/proof-of-cipher-paper/rulesets --input .github/release-tag-ruleset.json
gh repo edit PROXIMUS-RESEARCH-LABS-FOUNDATION/proof-of-cipher-paper --enable-issues --enable-discussions --delete-branch-on-merge --enable-squash-merge --enable-wiki=false
```

The branch rule requires passing checks, resolved conversations, and approval from the CODEOWNERS maintainer for contributor pull requests. Push/merge access is restricted to `orithellama`. Repository administrators retain their emergency override. External contributors use forks and are not granted repository write access. The tag rule prevents updates and deletion of published `v*` tags. Apply that rule once, then edit the existing rule in GitHub if needed.

Verify the active configuration:

```sh
gh api repos/PROXIMUS-RESEARCH-LABS-FOUNDATION/proof-of-cipher-paper/branches/main/protection
gh api repos/PROXIMUS-RESEARCH-LABS-FOUNDATION/proof-of-cipher-paper/rulesets
```

GitHub's [protected branch documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) describes the review controls and administrator override.

## Release an edition

Update the manuscript version, `package.json`, `package-lock.json`, `CITATION.cff`, and `CHANGELOG.md`. Keep a patch-only release's manuscript version unchanged. Run:

```sh
npm ci --ignore-scripts
npm run build
npm run check
git status
```

After review and merge, create an annotated tag for that exact commit. Write release notes to a file, then publish a release with:

```sh
gh release create v2.0.0 --verify-tag --title "Proof of Cipher v2.0.0" --notes-file CHANGELOG.md
```

Use the new version tag for later editions. Release notes must describe validated changes and must not describe publication tests as an audit of the protocol.

## Website synchronization

The initial repository sources match the website's complete manuscript and publication notices. The website's `scripts/export-proof-of-cipher.ts` exports those two JSON files into this repository. Run it only when intentionally importing a reviewed website revision, because it replaces the JSON sources.

Accepted paper-repository edits must be reviewed and incorporated into the website's manuscript and publication metadata before the next website release. Compare the exported JSON with the tagged repository source using `git diff -- manuscript/`, then rebuild and check. Website deployment remains a separate maintainer operation. Neither pull requests nor this repository's CI can deploy the website.
