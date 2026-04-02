#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @file @kaito-tokyo/minisign-verify/verify-js/minisign-verify-cli.mjs
 * A command-line interface for Minisign verification for Node.js.
 * @version 0.1.4
 * @since 2026-04-03
 */

import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";

import { getopt } from "./getopt.mjs";
import { MinisignVerifier } from "./index.mjs";

// This directory is intended to be self-contained and cannot assume the presence of package.json.
const VERSION = "0.1.4";

const usage = `Usage:
minisign-verify -V [-H] [-x sig_file] [-p pubkey_file | -P pubkey] [-o] [-q] -m file

-V                verify that a signature is valid for a given file
-H                ignored
-m <file>         file to sign/verify
-o                combined with -V, output the file content after verification
-p <pubkey_file>  public key file (default: ./minisign.pub)
-P <pubkey>       public key, as a base64 string
-x <sigfile>      signature file (default: <file>.minisig)
-q                quiet mode, suppress output
-Q                pretty quiet mode, only print the trusted comment
-v                display version number`;

/** @type {string | undefined} */
let pk_file;

/** @type {string | undefined} */
let pubkey_s;

/** @type {string | undefined} */
let message_file;

/** @type {string | undefined} */
let sig_file;

/** @type {boolean} */
let output = false;

/** @type {number} */
let quiet = 0;

/** @type {"ACTION_NONE" | "ACTION_VERIFY"} */
let action = "ACTION_NONE";

const opt_seen = new Set();

try {
  for (const { opt, optarg } of getopt(process.argv.slice(1), "VhHm:oP:p:qQvx:")) {
    if (opt === undefined) break;

    if (opt_seen.has(opt)) {
      console.error(`Duplicate option: -- ${opt}\n`);
      console.log(usage);
      process.exit(2);
    }

    opt_seen.add(opt);

    switch (opt) {
      case 'V':
        action = "ACTION_VERIFY";
        break;
      case 'h':
        console.log(usage);
        process.exit(2);
        break;
      case 'H':
        // ignored
        break;
      case 'm':
        message_file = optarg;
        break;
      case 'o':
        output = true;
        break;
      case 'p':
        pk_file = optarg;
        break;
      case 'P':
        pubkey_s = optarg;
        break;
      case 'q':
        quiet = 1;
        break;
      case 'Q':
        quiet = 2;
        break;
      case 'x':
        sig_file = optarg;
        break;
      case 'v':
        console.log(VERSION);
        process.exit(0);
        break;
      case '?':
        console.log(usage);
        process.exit(2);
    }
  }

  if (action === "ACTION_VERIFY") {
    if (message_file === undefined) {
      console.log(usage);
      process.exit(2);
    }

    if (sig_file === undefined || sig_file === "") {
      sig_file = `${message_file}.minisig`;
    }

    if (pk_file === undefined && pubkey_s === undefined) {
      pk_file = "./minisign.pub";
    }

    if (!pubkey_s && pk_file) {
      const pubkeyFileContent = await readFile(pk_file, "utf8");
      const lines = pubkeyFileContent.split(/\r?\n/);
      const pubkeyLine = lines[1]?.trim();
      if (!pubkeyLine) {
        throw new Error(`Invalid pubkey file: missing key line: ${pk_file}`);
      }
      pubkey_s = pubkeyLine;
    }

    if (pubkey_s === undefined) {
      console.error("A public key is required");
      process.exit(2);
    }

    const verifier = await MinisignVerifier.create(pubkey_s);
    const verifyResult = await verifier.verifyFilepath(message_file, sig_file);
    if (verifyResult.ok) {
      const infoLog = output ? console.error : console.log;

      if (quiet === 0) {
        infoLog("Signature and comment signature verified");
        infoLog(`Trusted comment: ${verifyResult.trustedComment}`);
      } else if (quiet === 2) {
        infoLog(verifyResult.trustedComment);
      }

      if (output) {
        await pipeline(createReadStream(message_file), process.stdout);
      }

      process.exit(0);
    } else {
      if (quiet === 0) {
        console.error("Signature verification failed");
      }
      process.exit(1);
    }
  } else {
    console.log(usage);
    process.exit(2);
  }
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`Error: ${message}`);
  console.log(usage);
  process.exit(2);
}
