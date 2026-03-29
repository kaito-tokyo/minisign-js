/**
 * MinisignVerifier is a helper class to verify Minisign signature on Node.js or its compatible environments.
 *
 * @example
 * ```js
 * import { MinisignVerifier } from "@kaito-tokyo/minisign-verify";
 *
 * const pubkeyStrings = ["PUBKEYBASE64STRING"];
 * const verifier = await MinisignVerifier.create(pubkeyStrings);
 *
 * const verifyResult = await verifier.verifyFilepath("test_fixtures/test.dat");
 * if (verifyResult.ok) {
 *   console.log("Verification succeeded!");
 * } else {
 *   throw new Error("Verification failed!");
 * }
 * ```
 */
export class MinisignVerifier {
    /**
     * Creates a MinisignVerifier instance with Minisign public key string(s).
     * @param {string | string[]} pubkeyStrings Minisign public key string(s).
     * @returns {Promise<MinisignVerifier>} A MinisignVerifier instance with the provided public key(s) loaded.
     */
    static create(pubkeyStrings: string | string[]): Promise<MinisignVerifier>;
    readPubkey: (pubkeyString: string) => Promise<import("./minisign.mjs").Pubkey>;
    parseSig: (sigString: string) => import("./minisign.mjs").Sig;
    parseSigFile: (sigFileContent: string) => import("./minisign.mjs").SigFile;
    /** @type {Map<import("./minisign.mjs").KeynumKey, import("./minisign.mjs").Pubkey>} */
    pubkeys: Map<import("./minisign.mjs").KeynumKey, import("./minisign.mjs").Pubkey>;
    /**
     * @param {string} pubkeyString
     */
    loadPubkeyString(pubkeyString: string): Promise<void>;
    /**
     * Verifies a Minisign signature.
     * @param {Readable | import("stream/web").ReadableStream | Parameters<Readable.from>[0]} message
     * @param {string | Parameters<import("node:stream/consumers").text>[0]} sigFileContent
     * @param {object} [options]
     * @param {AbortSignal} [options.signal]
     * @return {Promise<import("./minisign.mjs").VerifyMinisignResult>}
     */
    verify(message: Readable | import("stream/web").ReadableStream | Parameters<typeof Readable.from>[0], sigFileContent: string | Parameters<typeof text>[0], options?: {
        signal?: AbortSignal | undefined;
    }): Promise<import("./minisign.mjs").VerifyMinisignResult>;
    /**
     * Convenience method to verify a file on the filesystem.
     * @param {string} filepath The file path to the data to verify.
     * @param {string} [signatureFilepath] The file path to the `.minisig` file. Defaults to `${filepath}.minisig`.
     */
    verifyFilepath(filepath: string, signatureFilepath?: string): Promise<import("./minisign.mjs").VerifyMinisignResult>;
}
import { Readable } from "node:stream";
import { text } from 'node:stream/consumers';
