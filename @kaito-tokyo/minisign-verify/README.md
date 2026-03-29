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
import { MinisignVerifier } from "@kaito-tokyo/minisign-verify";

const verifier = await MinisignVerifier.create("PUBLICKEYBASE64");
const verifyResult = await verifier.verifyFilepath("file.zip");
if (!verifyResult.ok) {
  throw new Error("Verification failed!");
}

console.log("file.zip was verified!");
```

**CLI**:

```sh
npx @kaito-tokyo/minisign-verify -V -P "PUBLICKEYBASE64" -m "file.zip"
```

## Attribution

This implementation is based on the original [jedisct1/minisign](https://github.com/jedisct1/minisign) by Frank Denis, which is licensed under ISC.
