---
# SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
#
# SPDX-License-Identifier: Apache-2.0

strict: true

description: Audit the merged Pull Request by putting audit trail on the audit branch. COPILOT_GITHUB_TOKEN needs to be configured.

metadata:
  author: Kaito Udagawa
  version: "1.0.0"
  date: "2026-03-29"

engine:
  id: copilot
  model: gpt-5-mini

on:
  pull_request:
    types: [closed]

  workflow_dispatch:
    inputs:
      pr-number:
        required: true
        type: string

  reaction: none
  status-comment: false

if: github.event_name == 'workflow_dispatch' || github.event.pull_request.merged == true

permissions:
  contents: read
  pull-requests: read

steps:
  - name: Extract the Pull Request stamp
    shell: bash --noprofile --norc -euo pipefail -O nullglob {0}
    env:
      GH_TOKEN: ${{ github.token }}
      PR_NUMBER: ${{ inputs.pr-number || github.event.pull_request.number }}
    run: |
      if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
        echo "ERROR: Invalid input of pr-number!"
        exit 1
      fi

      gh pr view "$PR_NUMBER" > "/tmp/pr-stamp.txt"

safe-outputs:
  messages:
    append-only-comments: true
  upload-asset:
    branch: "audit/pr-stamp"
    allowed-exts: [.txt]
    max: 1

  activation-comments: false
  mentions:
    allow-team-members: false
    allow-context: false
  report-failure-as-issue: false
  staged: false
---

# Uploading a Pull Request stamp for Auditing

## Rules

You MUST not modify `/tmp/pr-stamp.txt` after the `Extract the Pull Request stamp` custom step on this workflow.

## Instructions

Call `upload_asset` tool with the path `/tmp/pr-stamp.txt`.
