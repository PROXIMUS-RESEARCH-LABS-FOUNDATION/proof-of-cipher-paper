# Proof of Cipher: Mapping the Invisible Internet Layer

Research whitepaper v2.0 - 23 November 2026

Published by **PROXIMUS Research Labs Foundation**. Protocol: Proximus.

[Read the full paper](https://www.proximus.sh/paper/proof-of-cipher) - [Research collection](https://www.proximus.sh/paper) - [Website](https://www.proximus.sh) - [Contact](mailto:hello@proximus.sh)

Proof of Cipher describes evidence provenance, public intelligence, Merkle transparency, and Solana commitments. The complete manuscript is available as [readable Markdown](paper.md), [LaTeX](manuscript/proof-of-cipher.tex), and a local HTML reader with rendered equations and tables.

## Run locally

Prerequisites: Node.js 22 or newer and npm. No API key, wallet, database, environment file, or blockchain transaction is needed.

```sh
cd /path/to/proof-of-cipher-paper
npm ci --ignore-scripts
npm run dev
```

Open <http://127.0.0.1:3000>. The server binds only to your laptop's loopback interface. It serves built publication files, never the repository or environment files. Fonts and equations are local, with no analytics or external runtime requests.

```sh
PORT=3100 npm run dev
npm run build
npm run check
```

After editing the source, run `npm run build` and reload the browser. `npm run start` serves the last build. Stop the server with Ctrl+C.

## Files and editing

| Path | Purpose |
| --- | --- |
| `manuscript/paper.json` | Complete manuscript, including native LaTeX math, tables, references, and publication notices |
| `manuscript/publication.json` | Publisher metadata, license, contribution permission, and disclaimer |
| `paper.md` | Generated GitHub-readable edition |
| `manuscript/proof-of-cipher.tex` | Generated A4 LaTeX edition |
| `LICENSE` | Custom CRL-1.0 terms and limited contribution permission |
| `DISCLAIMER.md` | Financial and technical disclaimer |
| `scripts/` | Deterministic publication renderer and local server |
| `tests/` | Math rendering, table structure, publication consistency, and local server checks |
| `dist/` | Generated local reader, excluded from Git |

Edit the JSON sources, then regenerate the Markdown and LaTeX with `npm run build`. When changing publication notices, update their matching sections in `paper.json` as well. `npm run check` rejects inconsistent notices or stale generated files.

The checks validate publication integrity and the reader. They do not establish a cryptographic audit, deployed protocol conformance, measured throughput, or blockchain state.

## Optional LaTeX compilation

With TeX Live or MacTeX installed:

```sh
cd manuscript
pdflatex -halt-on-error -interaction=nonstopmode proof-of-cipher.tex
pdflatex -halt-on-error -interaction=nonstopmode proof-of-cipher.tex
```

The source uses A4 paper and standard packages listed in its preamble. Two passes resolve the table of contents. Generated PDF and auxiliary files are excluded from Git. The website remains a full-text reader.

## Contributing

Open an issue for discussion, or fork the repository and submit a pull request for a proposed correction. See [CONTRIBUTING.md](CONTRIBUTING.md). Maintainers decide what enters the official paper. A fork or unmerged proposal is not an official publication.

After adding the GitHub remote, the maintainer can enable the supplied review and release controls using [the maintainer guide](MAINTAINERS.md). These configuration files do not claim remote protections are already enabled.

## Versions and attribution

Versioned editions use Git tags such as `v2.0.0`. The manuscript's major/minor version is shown on the website. Patch versions identify publication tooling and editorial releases. See [CHANGELOG.md](CHANGELOG.md).

The original v1.0 edition was published on 15 October 2025 by Proximus Labs PTE LTD, with Julian Kors listed as auditor. Those are historical credits, not a new independent audit of v2.0. The current publisher is PROXIMUS Research Labs Foundation.

## License and disclaimer

This is a public research repository under the custom [PROXIMUS Research Labs Foundation License (CRL-1.0)](LICENSE). Public availability does not make it an unrestricted open-source license. Reading, citation, and unaltered non-commercial sharing are permitted. Forks and modifications solely for the official contribution process are permitted by the contribution supplement. Commercial, derivative, or competing use otherwise requires written permission.

Read the [legal disclaimer](DISCLAIMER.md). This paper is not an offer or solicitation for any token, security, or financial instrument.

Copyright © 2025-2026 PROXIMUS Research Labs Foundation. All rights reserved.
