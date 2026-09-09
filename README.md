# Hearth & Code

Practical techniques for thinking, building and creating with AI. One technique, a working example, and a visible result.

Orientation dashboard: https://hearthandcode.github.io/

Fieldcraft library: https://hearthandcode.github.io/fieldcraft.html

## Run locally

Python 3.10+, Node.js 18+, and a Rust toolchain (`rustc`/`rustdoc`) for the compiler examples:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
node examples/check.test.mjs
node scripts/test_corpus.mjs
python scripts/build.py
python scripts/validate_corpus.py
python scripts/test_article_commands.py
python scripts/test_rust.py
python -m http.server 4173 --directory site
```

Open http://localhost:4173. The first article includes an interactive capacity/uniqueness check. It uses the same pure function as the executable tests. No backend, model provider, tracking, or third-party font requests.

## Content ownership

This repository is the public working surface for the Hearth & Code site, its orientation pages and the Fieldcraft library. `content/` contains explicitly selected public article masters; private source packages retain their ownership and are cited rather than copied. `publication.json` records source and exported digests. New public articles need an explicit allowlist entry and publication review. The build rejects drift from the released digest.

The first article established the adopted visual and editorial direction; the 32-article seed edition extends it. A publication is not a verification seal. Its mathematical expression is a pedagogical model, not normative ESS notation. Each indexed entry has an article, runnable example and interactive demonstration. The root page is a public Hearth & Code orientation dashboard; it keeps candidate, review-only and source-only material visibly bounded while linking to Fieldcraft as its practical library.

## Presentation

Ember Circuit palette adapted from the existing Hearth & Code public site: charcoal, parchment, copper, gold, violet and cyan. Original inline circuit illustration. System fonts; native MathML. Index structure inspired by [Hermes Wingtips](https://notwitcheer.github.io/hermes-recipes/wingtips/); no article text or visual assets copied.

## Publication

The Pages workflow builds only the released public snapshot. `site/` is generated and ignored by Git. A faulty release is corrected with a new commit and redeployment; the source master retains its history.

No license grant is implied by public visibility. License selection remains with Hearth & Code.

## Editorial contract

[HEARTHANDCODE-SITE.yaml](HEARTHANDCODE-SITE.yaml) is the root development and article-writing charter. [fieldcraft-contract.yaml](fieldcraft-contract.yaml) records the adopted article anatomy, notation rules, evidence boundaries, design tokens, responsive layout, demo interface and quality checks. RSS is available at `feed.xml`. New article code and fixtures must pass the corpus checks before publication.
