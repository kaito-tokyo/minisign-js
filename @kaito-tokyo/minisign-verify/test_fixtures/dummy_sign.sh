#!/bin/bash

# SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
#
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail
shopt -s nullglob

cd "${BASH_SOURCE[0]%/*}"

ROOT_DIR="$(cd ../../.. && pwd)"

SIGNING_ARGS=(
  -s "$ROOT_DIR/minisign_dummy_keypair/minisign.key"
  -p "$ROOT_DIR/minisign_dummy_keypair/minisign.pub"
  -S
)

minisign "${SIGNING_ARGS[@]}" -m empty.dat
minisign "${SIGNING_ARGS[@]}" -m test.dat
