// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

import assert from "node:assert";
import { suite, test } from "node:test";

import { execSync } from "node:child_process";

const localFixtures = [
  "empty.dat",
  "test.dat",
];

const pubkeyStrings = [
  "RWSBf6Tu0QagxVJavce10/fhuZs6PVLtjH/OfT0ma6nrwbyzTaqFXB9s", // minisign_dummy_keypair
];

suite("Local CLI tests", async () => {
  for (const fixture of localFixtures) {
    test(`${fixture}`, async () => {
      const filePath = `test_fixtures/${fixture}`;
      const output = execSync(`node ./verify-js/minisign-verify-cli.mjs -V -P ${pubkeyStrings[0]} -m ${filePath}`).toString();
      assert.ok(output.includes("Signature and comment signature verified"));
      assert.ok(output.includes("Trusted comment:"));
    });
  }
});
