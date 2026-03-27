---
# SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
#
# SPDX-License-Identifier: Apache-2.0

applyTo: "**/*.{yml,yaml}"
---

# Reviewing GitHub Actions workflows

## Available runner images we use

- `ubuntu-slim`: https://github.com/actions/runner-images/blob/main/images/ubuntu-slim/ubuntu-slim-Readme.md
- `ubuntu-latest`: https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md

## Inputs for `actions/setup-python` we use

- **python-version**: Version range or exact version of Python or PyPy to use, using SemVer's version range syntax. Reads from .python-version if unset.
- **pip-install**: Used to specify the packages to install with pip after setting up Python. Can be a requirements file or package names.
