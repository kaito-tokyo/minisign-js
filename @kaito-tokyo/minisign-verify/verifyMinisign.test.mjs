// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

import assert from "node:assert";
import { suite, test } from "node:test";

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";

import { parsePubkey, parseSigFile, verifyMinisign } from "@kaito-tokyo/minisign-verify";

const localFixtures = [
  "empty.dat",
  "test.dat",
];

const remoteAssets = [
  "https://github.com/ccache/ccache/releases/download/v4.12.3/ccache-4.12.3-linux-x86_64.tar.xz",
  "https://github.com/jedisct1/minisign/releases/download/0.12/minisign-0.12-linux.tar.gz",
];

async function loadPubkeys() {
  const pubkeyStrings = [
    "RWSBf6Tu0QagxVJavce10/fhuZs6PVLtjH/OfT0ma6nrwbyzTaqFXB9s", // minisign_dummy_keypair
    "RWQX7yXbBedVfI4PNx6FLdFXu9GHUFsr28s4BVGxm4BeybtnX3P06saF", // ccache
    "RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3", // minisign
  ];

  const pubkeyEntries = await Promise.all(pubkeyStrings.map(async (pubkeyString) => {
    const pubkey = await parsePubkey(pubkeyString);
    return [pubkey.key, pubkey];
  }));
  return new Map(/** @type {Array<[string, any]>} */ (pubkeyEntries));
}

suite("Local tests", async () => {
  const pubkeys = await loadPubkeys();

  for (const fixture of localFixtures) {
    test(`Local ${fixture}`, async () => {
      const filePath = `test_fixtures/${fixture}`;
      const sigFileContent = await readFile(`${filePath}.minisig`, "utf-8");
      const sigFile = await parseSigFile(sigFileContent);
      const verifyResult = await verifyMinisign(pubkeys, sigFile, async (blake2b512Required) => {
        if (blake2b512Required) {
          const hash = createHash("blake2b512");
          await pipeline(createReadStream(filePath), hash);
          return hash.digest();
        } else {
          return await readFile(filePath);
        }
      });
      assert.deepEqual(verifyResult, {
        ok: true,
        isMessageValid: true,
        isCommentValid: true,
      });
    });
  }
});

suite("Remote tests", { skip: process.env.ENABLE_LARGE_TESTS !== '1' }, async () => {
  const pubkeys = await loadPubkeys();

  for (const url of remoteAssets) {
    test(`Remote ${url}`, async () => {
      const resMessage = await fetch(url);
      assert.ok(resMessage.ok);

      const resMinisig = await fetch(`${url}.minisig`);
      assert.ok(resMinisig.ok);

      const sigFileContent = await resMinisig.text();
      const sigFile = await parseSigFile(sigFileContent);

      const verifyResult = await verifyMinisign(pubkeys, sigFile, async (blake2b512Required) => {
        if (blake2b512Required) {
          const hash = createHash("blake2b512")
          hash.update(new Uint8Array(await resMessage.arrayBuffer()));
          return hash.digest();
        } else {
          return await resMessage.arrayBuffer();
        }
      });

      assert.deepEqual(verifyResult, {
        ok: true,
        isMessageValid: true,
        isCommentValid: true,
      });
    });
  }
});
