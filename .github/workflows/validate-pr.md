---
# SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
#
# SPDX-License-Identifier: Apache-2.0

description: Validate if this Pull Request meets our project criteria. COPILOT_GITHUB_TOKEN needs to be configured.

on:
  label_command:
    name: validate
    events: [pull_request]

metadata:
  author: Kaito Udagawa
  version: "1.1.0"

permissions:
  contents: read
  pull-requests: read

if: startsWith(github.ref, 'refs/pull/')

steps:
  - name: Fetch Pull Request commits
    shell: bash --noprofile --norc -euo pipefail -O nullglob {0}
    env:
      GH_TOKEN: ${{ github.token }}
    run: |
      ARGS=(
        "repos/$GITHUB_REPOSITORY/pulls/${REF_NAME%/merge}/commits"
        -H "Accept: application/vnd.github+json"
        -H "X-GitHub-Api-Version: 2026-03-10"
        --paginate
        --jq '[.[] | {sha: .sha, message: .commit.message, verification: .commit.verification}]'
      )
      gh api "${ARGS[@]}" > /tmp/gh-aw/agent/pr_commits.json

  - name: Extract items on Pull Request Checklist
    shell: bash --noprofile --norc -euo pipefail -O nullglob {0}
    env:
      GH_TOKEN: ${{ github.token }}
    run: |
      mkdir -p /tmp/gh-aw/agent

      VALID_ITEMS=(
        'I have read the latest CONTRIBUTING.md.'
        'I have signed off and verified all my commits.'
      )

      GH_PR_VIEW_ARGS=(
        --json body
        --jq '[.body | splits("\r?\n") | match("^- \\[[ xX]\\] (.*)$")]'
      )

      gh pr view "${GH_PR_VIEW_ARGS[@]}" > /tmp/raw_pr_checklist.json

      {
        echo '## Pull Request Checklist (Listing all the valid items, incluing not found errors)'
        echo
        for item in "${VALID_ITEMS[@]}"; do
          if ! jq -e -r --arg item "$item" '.[] | select(.captures[0].string == $item) | .string' /tmp/raw_pr_checklist.json; then
            echo "# ERROR: No lines found for '$item'"
          fi
        done
      } >/tmp/gh-aw/agent/pr_checklist.md

safe-outputs:
  messages:
    append-only-comments: true

  add-comment:

  jobs:
    accept-validate-pr:
      name: Accept validate-pr
      description: Decide if the result of this workflow is acceptable.

      inputs:
        commit-signing:
          description: A boolean value to represent if commit signing check is passed or not.
          required: true
          type: boolean
        dco:
          description: A boolean value to represent if DCO check is passed or not.
          required: true
          type: boolean
        pull-request-checklist:
          description: A boolean value to represent if Pull Request Checklist check is passed or not.
          required: true
          type: boolean

      runs-on: ubuntu-slim

      permissions: {}

      steps:
        - name: Accept or Reject
          id: accept-reject
          shell: bash --noprofile --norc -euo pipefail -O nullglob {0}
          env:
            COMMIT_SIGNING: ${{ inputs.commit-signing }}
            DCO: ${{ inputs.dco }}
            PULL_REQUEST_CHECKLIST: ${{ inputs.pull-request-checklist }}
          run: |
            rejected=0
            messages=()

            if ! [[ "$COMMIT_SIGNING" = true ]]; then
              messages+=("Commit Signing check was rejected.")
              rejected=1
            fi

            if ! [[ "$DCO" = true ]]; then
              messages+=("DCO check was rejected.")
              rejected=1
            fi

            if ! [[ "$PULL_REQUEST_CHECKLIST" = true ]]; then
              messages+=("Pull Request Checklist check was rejected.")
              rejected=1
            fi

            if [[ "$rejected" -eq 1 ]]; then
              messages+=("ERROR: $GITHUB_JOB_ID rejected this check.")
            else
              messages+=("$GITHUB_JOB_ID accepted the overall result.")
            fi

            for m in "${messages[@]}"; do
              printf '%s\n' "$m"
            done

            exit "$rejected"

engine:
  id: copilot
  model: gpt-5-mini
---

# Validate Pull Request

Validate if this Pull Request meets our project criteria.

## Trigger

This workflow is triggered by label command on Pull Request.

## Checks

- **Commit Signing**
  - **Input**: Read `/tmp/gh-aw/agent/pr_commits.json` for summerized commit objects.
  - **Verification**: Inspect the `verification` object of every commit on this Pull Request, and verify if all commits on this Pull Request are properly signed.
  - **Context**: Refer to `CONTRIBUTING.md` for this commit signing policy.

- **DCO (Developer’s Certificate of Origin)**
  - **Input**: Read `/tmp/gh-aw/agent/pr_commits.json` for summerized commit objects.
  - **Verification**: Inspect the `message` field of every commit on this Pull Request, and verify if all commits on this Pull Request contain a valid `Signed-off-by:` trailer for DCO compliance.
  - **Context**: Refer to `CONTRIBUTING.md` for this policy.

- **Pull Request Checklist**
  - **Input**: Read `/tmp/gh-aw/agent/pr_checklist.md` for extracted and sanitized Pull Request checklist using whitelist.
  - **Verification:** Read the extracted Pull Request checklist, and verify if it contains the Pull Request template and all the items are checked.

## Outputs

- **Pull Request Comment**: A human-friendly summary MUST be posted on Pull Request.
  - **Output Format**: Add a single Pull Request comment for the check result.
  - **Summary Line**: The first line of your comment MUST be a single-line summary of this validation, starting with either ✅ or 🚫. Call validate-pr-result with the boolean result of this check.
- **Accept tool**: You MUST provide the check result with the accept tool to control merge admittance.
  - **Output Method**: Call the accept-validate-pr tool with the check results.
