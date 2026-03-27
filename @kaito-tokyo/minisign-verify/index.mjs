// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @file @kaito-tokyo/minisign-verify
 * Self-contained Minisign signature verification library for ES Modules.
 * @version 1.0.0
 * @since 2026-03-27
 */

/**
 * @typedef {Object} Pubkey Public key of minisign verification.
 * @property {string} key Opaque key for Map<string, Pubkey> that can be used with `verifyMinisign()`.
 * @property {CryptoKey} cryptoKey internal field
 * @property {'Ed'} sigAlg internal field
 * @property {Uint8Array<ArrayBuffer>} keynum internal field
 * @property {Uint8Array<ArrayBuffer>} pk internal field
 *
 * @typedef {Object} Sig Single signature data of minisign verification.
 * @property {string} key internal field
 * @property {'Ed' | 'ED'} sigAlg internal field
 * @property {Uint8Array<ArrayBuffer>} keynum internal field
 * @property {Uint8Array<ArrayBuffer>} sig internal field
 *
 * @typedef {Object} SigFile Signature file of minisign verification.
 * @property {string} comment internal field
 * @property {Sig} sig internal field
 * @property {string} trustedComment internal field
 * @property {Uint8Array<ArrayBuffer>} globalSig internal field
 *
 * @typedef {Object} VerifyMinisignResult
 * @property {boolean} ok Verification result overall.
 * @property {boolean} isMessageValid The integrity of the data.
 * @property {boolean} isCommentValid The integrity of the signature file.
 */

const KEYNUMBYTES = 8;
const SIGALG = "Ed";
const SIGALG_HASHED = "ED";
const COMMENT_PREFIX = "untrusted comment: ";
const TRUSTED_COMMENT_PREFIX = "trusted comment: ";

const crypto_sign_PUBLICKEYBYTES = 32;
const crypto_sign_BYTES = 64;

/**
 * @param {ArrayBuffer | ArrayBufferView<ArrayBuffer>} arrayBuffer
 */
function arrayBufferToUint8Array(arrayBuffer) {
  if (ArrayBuffer.isView(arrayBuffer)) {
    return new Uint8Array(arrayBuffer.buffer, arrayBuffer.byteOffset, arrayBuffer.byteLength);
  } else {
    return new Uint8Array(arrayBuffer);
  }
}

/**
 * @param {string} base64String
 * @return {Promise<Uint8Array<ArrayBuffer>>}
 */
async function base64ToUint8Array(base64String) {
  if ('fromBase64' in Uint8Array && typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(base64String);
  } else if (typeof Buffer !== "undefined") {
    return Buffer.from(base64String, "base64");
  } else if (typeof fetch === "function") {
    const res = await fetch(
      `data:application/octet-stream;base64,${base64String}`,
    );
    if (!res.ok) throw new Error("Base64DecodingError");
    return new Uint8Array(await res.arrayBuffer());
  } else {
    throw new Error("Base64DecodingNotSupportedError");
  }
}

/**
 * @param {ArrayBuffer | ArrayBufferView<ArrayBuffer>} arrayBuffer
 * @return {Promise<string>}
 */
async function arrayBufferToBase64url(arrayBuffer) {
  const uint8Array = arrayBufferToUint8Array(arrayBuffer);

  if ('toBase64' in uint8Array && typeof uint8Array.toBase64 === "function") {
    return uint8Array.toBase64({ alphabet: "base64url", omitPadding: true });
  } else if (typeof Buffer !== "undefined") {
    return Buffer.from(uint8Array).toString("base64url");
  } else {
    throw new Error("Base64EncodingNotSupportedError");
  }
}

/**
 * Parses a minisign public key in the form of Base64-string.
 * @param {string} pubkeyString The Base64-string of the public key.
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @param {typeof arrayBufferToBase64url} [_arrayBufferToBase64url]
 * @return {Promise<Pubkey>}
 */
export async function parsePubkey(
  pubkeyString,
  _base64ToUint8Array = base64ToUint8Array,
  _arrayBufferToBase64url = arrayBufferToBase64url,
) {
  const bytes = await _base64ToUint8Array(pubkeyString);

  if (bytes.length !== 2 + KEYNUMBYTES + crypto_sign_PUBLICKEYBYTES) {
    throw new Error("InvalidPubkeyLengthError");
  }

  const sigAlgBytes = bytes.subarray(0, 2);
  const keynum = bytes.subarray(2, 2 + KEYNUMBYTES);
  const pk = bytes.subarray(2 + KEYNUMBYTES);

  if (sigAlgBytes[0] !== /*E*/ 0x45 || sigAlgBytes[1] !== /*d*/ 0x64) {
    throw new Error("InvalidSigAlgError");
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "OKP",
      crv: "Ed25519",
      x: await _arrayBufferToBase64url(pk),
    },
    { name: "Ed25519" },
    false,
    ["verify"],
  );

  return {
    key: JSON.stringify(Array.from(keynum)),
    cryptoKey,
    sigAlg: SIGALG,
    keynum,
    pk,
  };
}

/**
 * Parses a minisign signature in the form of Base64-string.
 * @param {string} sigString The Base64-string of the signature.
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @return {Promise<Sig>}
 */
export async function parseSig(
  sigString,
  _base64ToUint8Array = base64ToUint8Array,
) {
  const bytes = await _base64ToUint8Array(sigString);

  if (bytes.length !== 2 + KEYNUMBYTES + crypto_sign_BYTES) {
    throw new Error("InvalidSigLengthError");
  }

  const sigAlgBytes = bytes.subarray(0, 2);
  const keynum = bytes.subarray(2, 2 + KEYNUMBYTES);
  const sig = bytes.subarray(2 + KEYNUMBYTES);

  /** @type {'Ed' | 'ED' | undefined} */
  let sigAlg;
  if (sigAlgBytes[0] === /*E*/ 0x45) {
    if (sigAlgBytes[1] === /*d*/ 0x64) {
      sigAlg = SIGALG;
    } else if (sigAlgBytes[1] === /*D*/ 0x44) {
      sigAlg = SIGALG_HASHED;
    }
  }

  if (!sigAlg) {
    throw new Error("InvalidSigAlgError");
  }

  return { key: JSON.stringify(Array.from(keynum)), sigAlg, keynum, sig };
}

/**
 * Parses a `.minisig` file content.
 * @param {string} sigFileContent The content of the `.minisig` file as a string.
 * @param {typeof parseSig} [_parseSig]
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @return {Promise<SigFile>}
 */
export async function parseSigFile(
  sigFileContent,
  _parseSig = parseSig,
  _base64ToUint8Array = base64ToUint8Array,
) {
  const lines = sigFileContent.split(/\r?\n/);

  if (lines.length < 4) {
    throw new Error("InvalidSigContentError");
  }

  const [commentLine, sigString, trustedCommentLine, globalSigString] = lines;

  if (!commentLine.startsWith(COMMENT_PREFIX)) {
    throw new Error("InvalidUntrustedCommentError");
  }

  if (!trustedCommentLine.startsWith(TRUSTED_COMMENT_PREFIX)) {
    throw new Error("InvalidTrustedCommentError");
  }

  const comment = commentLine.substring(COMMENT_PREFIX.length);
  const sig = await _parseSig(sigString, _base64ToUint8Array);
  const trustedComment = trustedCommentLine.substring(
    TRUSTED_COMMENT_PREFIX.length,
  );
  const globalSig = await _base64ToUint8Array(globalSigString);

  if (globalSig.length !== crypto_sign_BYTES) {
    throw new Error("InvalidGlobalSigLengthError");
  }

  return { comment, sig, trustedComment, globalSig };
}

/**
 * @param {Pubkey | Map<string, Pubkey>} pubkeys The minisign public key(s) from `parsePubkey()`.
 *   Provide a Pubkey, or construct a map with `new Map(pubkeys.map(pk => [pk.key, pk]))`.
 * @param {SigFile} sigFile The `.minisig` content from `parseSigFile()`.
 * @param {(blake2b512Required: boolean) => Promise<ArrayBuffer | ArrayBufferView<ArrayBuffer>>} dataFunc Function to get the data to verify.
 *   If `blake2b512Required` is `true`: Return BLAKE2b-512 hash of the data to verify.
 *   If `blake2b512Required` is `false`: Return the raw data.
 * @return {Promise<VerifyMinisignResult>} The result of the verification.
 *   Use its `ok` property to check if verification was successful.
 */
export async function verifyMinisign(pubkeys, sigFile, dataFunc) {
  const pubkey = pubkeys instanceof Map ? pubkeys.get(sigFile.sig.key) : pubkeys;
  if (!pubkey) throw new Error("PubkeyNotFoundError");
  const { cryptoKey } = pubkey;
  const {
    sig: { sigAlg, sig },
    trustedComment,
    globalSig,
  } = sigFile;

  if (sigAlg !== SIGALG_HASHED && sigAlg !== SIGALG) {
    throw new Error("UnsupportedSigAlgError");
  }

  const isMessageValid = await crypto.subtle.verify(
    { name: "Ed25519" },
    cryptoKey,
    sig,
    await dataFunc(sigAlg === SIGALG_HASHED),
  );

  const trustedCommentBytes = new TextEncoder().encode(trustedComment);
  const sigAndTrustedComment = new Uint8Array(
    sig.length + trustedCommentBytes.length,
  );
  sigAndTrustedComment.set(sig, 0);
  sigAndTrustedComment.set(trustedCommentBytes, sig.length);

  const isCommentValid = await crypto.subtle.verify(
    { name: "Ed25519" },
    cryptoKey,
    globalSig,
    sigAndTrustedComment,
  );

  return {
    ok: isMessageValid && isCommentValid,
    isMessageValid,
    isCommentValid,
  };
}
