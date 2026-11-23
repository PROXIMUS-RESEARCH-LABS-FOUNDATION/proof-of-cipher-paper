# Contributing to Proof of Cipher

## Propose a change

1. Read [LICENSE](LICENSE) and [DISCLAIMER.md](DISCLAIMER.md).
2. Open an issue to describe the correction or research question. For private security issues, follow [SECURITY.md](SECURITY.md).
3. Fork the repository and create a descriptive branch.
4. Edit `manuscript/paper.json`, with publication metadata changes also reflected in `manuscript/publication.json`.
5. Run `npm ci --ignore-scripts`, `npm run build`, and `npm run check`.
6. Review the localhost reader and generated Markdown and LaTeX. Include exact source references for technical claims.
7. Submit a pull request with the problem, proposed change, sources, and validation results.

Do not include credentials, private scanner outputs, personal account information, production infrastructure details, or claims of measured behavior without supporting evidence. Use fictional targets and non-sensitive examples.

## Review and publication

Maintainers review changes, request revisions, and decide whether to merge. Accepted changes enter `main`. Maintainers create version tags and release notes for official editions. Website publication is a separate maintainer action and is never triggered by an outside pull request.

Preserve the distinction between design descriptions, illustrative calculations, and measured results. Do not describe the renderer tests as a protocol audit. Do not change algorithms or mathematical assumptions as a formatting-only edit.

## Contribution permission

The license permits forks and modifications solely to propose contributions through the official repository. Mark unmerged versions as unofficial proposals and preserve the license and attribution. It does not grant permission for commercial, derivative, or competing publication outside that review process.

By submitting a contribution, you confirm that you have the right to submit it and authorize PROXIMUS Research Labs Foundation to review, edit, and incorporate it into the official Work under the repository's license and contribution permission. You retain copyright in your original contribution. Do not submit third-party material without the necessary permission and attribution.

## Style

- Use descriptive headings and upright prose, with no italic emphasis.
- Use ASCII dashes as separators and no semicolons in prose.
- Keep native LaTeX math and structured table cells.
- Use `PROXIMUS Research Labs Foundation` for the current organization name.
- Preserve historical source attribution where it refers to the original publication.
