#!/bin/bash

# SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
#
# SPDX-License-Identifier: CC0-1.0

set -euo pipefail
shopt -s nullglob

filter='
{
  name,
  version,
  description,
  keywords,
  homepage,
  bugs,
  repository,
  license,
  author,
  type,
  main,
  types,
  exports,
  files,
  engines,
  scripts,
  dependencies,
  devDependencies,
  peerDependencies,
  publishConfig
} + . | with_entries(select(.value != null))
'

for f in package.json @kaito-tokyo/*/package.json; do
  jq "$filter" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
