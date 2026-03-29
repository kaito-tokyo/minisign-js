// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

import assert from "node:assert";
import { suite, test } from "node:test";

import { MinisignVerifier } from "@kaito-tokyo/minisign-verify";

const localFixtures = [
  "empty.dat",
  "test.dat",
];

const remoteAssets = [
  "https://github.com/ccache/ccache/releases/download/v4.12.3/ccache-4.12.3-linux-x86_64.tar.xz",
  "https://github.com/jedisct1/minisign/releases/download/0.12/minisign-0.12-linux.tar.gz",
];

const pubkeyStrings = [
  "RWSBf6Tu0QagxVJavce10/fhuZs6PVLtjH/OfT0ma6nrwbyzTaqFXB9s", // minisign_dummy_keypair
  "RWQX7yXbBedVfI4PNx6FLdFXu9GHUFsr28s4BVGxm4BeybtnX3P06saF", // ccache
  "RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3", // minisign
];

suite("Local tests", async () => {
  const verifier = await MinisignVerifier.create(pubkeyStrings);

  for (const fixture of localFixtures) {
    test(`Local ${fixture}`, async () => {
      const filePath = `test_fixtures/${fixture}`;
      const verifyResult = await verifier.verifyFilepath(filePath);
      assert.ok(verifyResult.ok);

      // Additional checks for API consistency
      assert.ok(verifyResult.isPubkeyFound);
      assert.ok(verifyResult.isMessageValid);
      assert.ok(verifyResult.isCommentValid);
    });
  }
});

suite("Remote tests", { skip: process.env.ENABLE_LARGE_TESTS !== '1' }, async () => {
  const verifier = await MinisignVerifier.create(pubkeyStrings);

  for (const url of remoteAssets) {
    test(`Remote ${url}`, async () => {
      const { body: message, ok: messageOk } = await fetch(url);
      assert.ok(messageOk);

      const sigFileRes = await fetch(`${url}.minisig`);
      assert.ok(sigFileRes.ok);
      const sigFileContent = await sigFileRes.text();

      const verifyResult = await verifier.verify(message, sigFileContent);
      assert.ok(verifyResult.ok);

      // Additional checks for API consistency
      assert.ok(verifyResult.isPubkeyFound);
      assert.ok(verifyResult.isMessageValid);
      assert.ok(verifyResult.isCommentValid);
    });
  }
});
