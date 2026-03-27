/**
 * Parses a minisign public key in the form of Base64-string.
 * @param {string} pubkeyString The Base64-string of the public key.
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @param {typeof arrayBufferToBase64url} [_arrayBufferToBase64url]
 * @return {Promise<Pubkey>}
 */
export function parsePubkey(pubkeyString: string, _base64ToUint8Array?: typeof base64ToUint8Array, _arrayBufferToBase64url?: typeof arrayBufferToBase64url): Promise<Pubkey>;
/**
 * Parses a minisign signature in the form of Base64-string.
 * @param {string} sigString The Base64-string of the signature.
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @return {Promise<Sig>}
 */
export function parseSig(sigString: string, _base64ToUint8Array?: typeof base64ToUint8Array): Promise<Sig>;
/**
 * Parses a `.minisig` file content.
 * @param {string} sigFileContent The content of the `.minisig` file as a string.
 * @param {typeof parseSig} [_parseSig]
 * @param {typeof base64ToUint8Array} [_base64ToUint8Array]
 * @return {Promise<SigFile>}
 */
export function parseSigFile(sigFileContent: string, _parseSig?: typeof parseSig, _base64ToUint8Array?: typeof base64ToUint8Array): Promise<SigFile>;
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
export function verifyMinisign(pubkeys: Pubkey | Map<string, Pubkey>, sigFile: SigFile, dataFunc: (blake2b512Required: boolean) => Promise<ArrayBuffer | ArrayBufferView<ArrayBuffer>>): Promise<VerifyMinisignResult>;
/**
 * Public key of minisign verification.
 */
export type Pubkey = {
    /**
     * Opaque key for Map<string, Pubkey> that can be used with `verifyMinisign()`.
     */
    key: string;
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
 * Single signature data of minisign verification.
 */
export type Sig = {
    /**
     * internal field
     */
    key: string;
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
 * Signature file of minisign verification.
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
export type VerifyMinisignResult = {
    /**
     * Verification result overall.
     */
    ok: boolean;
    /**
     * The integrity of the data.
     */
    isMessageValid: boolean;
    /**
     * The integrity of the signature file.
     */
    isCommentValid: boolean;
};
/**
 * @param {string} base64String
 * @return {Promise<Uint8Array<ArrayBuffer>>}
 */
declare function base64ToUint8Array(base64String: string): Promise<Uint8Array<ArrayBuffer>>;
/**
 * @param {ArrayBuffer | ArrayBufferView<ArrayBuffer>} arrayBuffer
 * @return {Promise<string>}
 */
declare function arrayBufferToBase64url(arrayBuffer: ArrayBuffer | ArrayBufferView<ArrayBuffer>): Promise<string>;
export {};
