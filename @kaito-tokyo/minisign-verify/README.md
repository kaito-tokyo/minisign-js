<!--
SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>

SPDX-License-Identifier: CC0-1.0
-->

# @kaito-tokyo/minisign-verify

Self-contained Minisign signature verification library for ES Modules.

Licensed under Apache-2.0.

## Installation

```
npm install @kaito-tokyo/minisign-verify
```

## How to use

**Node.js (24.x or later):**

```js
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";

import { parsePubkey, parseSigFile, verifyMinisign } from "@kaito-tokyo/minisign-verify";

const filePath = "file.zip";

const pubkey = await parsePubkey("PUBKEY_STRING");
const sigFile = await parseSigFile(await readFile(`${filePath}.minisig`, "utf8"));
const dataFunc = async (blake2b512Required) => {
  if (blake2b512Required) {
    const hash = createHash("blake2b512");
    await pipeline(createReadStream(filePath), hash);
    return hash.digest();
  } else {
    return readFile(filePath);
  }
};

const verifyResult = await verifyMinisign(pubkey, sigFile, dataFunc);

if (!verifyResult.ok) throw new Error("Verification failed!");

console.log(`${filePath} was verified!`)
```

## Attribution

This implementation is based on the original [jedisct1/minisign](https://github.com/jedisct1/minisign) by Frank Denis, which is licensed under ISC.
