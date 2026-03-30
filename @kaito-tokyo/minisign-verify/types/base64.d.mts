/**
 * @file @kaito-tokyo/minisign-verify/verify-js/base64.mjs
 * Base64 utilities for Modern JavaScript environments.
 * @version 0.1.3
 * @since 2026-03-29
 */
/**
 * Encodes an ArrayBuffer to a Base64url-string.
 * @template {ArrayBufferLike} TArrayBuffer
 * @param {TArrayBuffer | ArrayBufferView<TArrayBuffer>} arrayBuffer
 * @return {string}
 */
export function arrayBufferToBase64url<TArrayBuffer extends ArrayBufferLike>(arrayBuffer: TArrayBuffer | ArrayBufferView<TArrayBuffer>): string;
/**
 * Returns a Uint8Array from ArrayBuffer efficiently.
 * @template {ArrayBufferLike} TArrayBuffer
 * @param {TArrayBuffer | ArrayBufferView<TArrayBuffer>} arrayBuffer
 * @returns {Uint8Array<TArrayBuffer>}
 */
export function arrayBufferToUint8Array<TArrayBuffer extends ArrayBufferLike>(arrayBuffer: TArrayBuffer | ArrayBufferView<TArrayBuffer>): Uint8Array<TArrayBuffer>;
/**
 * Decodes a Base64-string to a Uint8Array.
 * @param {string} base64String
 * @return {Uint8Array<ArrayBuffer>}
 */
export function base64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer>;
