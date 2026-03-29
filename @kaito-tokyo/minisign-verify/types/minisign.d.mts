/**
 * Asynchronously reads a Minisign public key in the form of Base64-string.
 * @param {typeof import("./base64.mjs").arrayBufferToBase64url} $arrayBufferToBase64url
 * @param {typeof import("./base64.mjs").base64ToUint8Array} $base64ToUint8Array
 * @param {string} pubkeyString The Base64-string of the public key.
 * @return {Promise<Pubkey>}
 */
export function readPubkey($arrayBufferToBase64url: typeof import("./base64.mjs").arrayBufferToBase64url, $base64ToUint8Array: typeof import("./base64.mjs").base64ToUint8Array, pubkeyString: string): Promise<Pubkey>;
/**
 * Parses a Minisign signature in the form of Base64-string.
 * @param {typeof import("./base64.mjs").base64ToUint8Array} $base64ToUint8Array
 * @param {string} sigString The Base64-string of the signature.
 * @return {Sig}
 */
export function parseSig($base64ToUint8Array: typeof import("./base64.mjs").base64ToUint8Array, sigString: string): Sig;
/**
 * Parses a `.minisig` file content.
 * @param {typeof parseSig} $parseSig
 * @param {typeof import("./base64.mjs").base64ToUint8Array} $base64ToUint8Array
 * @param {string} sigFileContent The content of the `.minisig` file as a string.
 * @return {SigFile}
 */
export function parseSigFile($parseSig: typeof parseSig, $base64ToUint8Array: typeof import("./base64.mjs").base64ToUint8Array, sigFileContent: string): SigFile;
/**
 * Gets the key for Map<PubkeyMapKey, Pubkey> from a Pubkey.
 * @param {Pubkey | Sig} pubkey
 * @return {KeynumKey}
 */
export function getKeynumKey(pubkey: Pubkey | Sig): KeynumKey;
/**
 * @param {Pubkey | Map<KeynumKey, Pubkey>} pubkeys The Minisign public key(s) from `readPubkey()`.
 *   Provide a Pubkey, or construct a map with `new Map(pubkeys.map(pk => [getKeynumKey(pk), pk]))`.
 * @param {SigFile} sigFile The `.minisig` content from `parseSigFile()`.
 * @param {(blake2b512Required: boolean) => Promise<ArrayBuffer | ArrayBufferView<ArrayBuffer>>} dataFunc
 *   Callback to get the data to verify. Called exactly once if no exception is thrown, and never called more than once.
 *   If `blake2b512Required` is `true`: Return BLAKE2b-512 hash of the data to verify.
 *   If `blake2b512Required` is `false`: Return the raw data.
 * @return {Promise<VerifyMinisignResult>} The result of the verification.
 *   Use its `ok` property to check if verification was successful.
 */
export function verifyMinisign(pubkeys: Pubkey | Map<KeynumKey, Pubkey>, sigFile: SigFile, dataFunc: (blake2b512Required: boolean) => Promise<ArrayBuffer | ArrayBufferView<ArrayBuffer>>): Promise<VerifyMinisignResult>;
/**
 * Public key of Minisign verification.
 */
export type Pubkey = {
    /**
     * internal field
     */
    cryptoKey: CryptoKey;
    /**
     * internal field
     */
    sigAlg: "Ed";
    /**
     * internal field
     */
    keynum: Uint8Array<ArrayBuffer>;
    /**
     * internal field
     */
    pk: Uint8Array<ArrayBuffer>;
};
/**
 * Single signature data of Minisign verification.
 */
export type Sig = {
    /**
     * internal field
     */
    sigAlg: "Ed" | "ED";
    /**
     * internal field
     */
    keynum: Uint8Array<ArrayBuffer>;
    /**
     * internal field
     */
    sig: Uint8Array<ArrayBuffer>;
};
/**
 * Signature file of Minisign verification.
 */
export type SigFile = {
    /**
     * internal field
     */
    comment: string;
    /**
     * internal field
     */
    sig: Sig;
    /**
     * internal field
     */
    trustedComment: string;
    /**
     * internal field
     */
    globalSig: Uint8Array<ArrayBuffer>;
};
/**
 * The key type for a Pubkey Map based on keynum.
 */
export type KeynumKey = bigint;
export type VerifyMinisignSuccessResult = {
    /**
     * Overall verification result.
     */
    ok: true;
    /**
     * The verified trusted comment from the signature file.
     */
    trustedComment: string;
    /**
     * Whether the public key was found.
     */
    isPubkeyFound: boolean;
    /**
     * The integrity of the data.
     */
    isMessageValid: boolean;
    /**
     * The integrity of the signature file.
     */
    isCommentValid: boolean;
};
export type VerifyMinisignFailureResult = {
    /**
     * Overall verification result.
     */
    ok: false;
    /**
     * Whether the public key was found.
     */
    isPubkeyFound: boolean;
    /**
     * The integrity of the data.
     */
    isMessageValid: boolean;
    /**
     * The integrity of the signature file.
     */
    isCommentValid: boolean;
};
export type VerifyMinisignResult = VerifyMinisignSuccessResult | VerifyMinisignFailureResult;
