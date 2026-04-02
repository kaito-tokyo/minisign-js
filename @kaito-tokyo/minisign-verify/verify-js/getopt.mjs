// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @file @kaito-tokyo/minisign-verify/verify-js/getopt.mjs
 * Getopt implementation in JavaScript, inspired by the POSIX getopt function.
 * @version 0.1.4
 * @since 2026-04-03
 * @license Apache-2.0
 */

/**
 * @typedef {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"} Digit
 * @typedef {"a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"|"n"|"o"|"p"|"q"|"r"|"s"|"t"|"u"|"v"|"w"|"x"|"y"|"z"} Letter
 * @typedef {Digit|Letter|Uppercase<Letter>|"?"} OptChar
 */

/**
 * @param {string} optstring
 * @return {{flags: OptChar[], withArg: OptChar[]}}
 */
function parseOptstring(optstring) {
  /** @type {OptChar[]} */
  const flags = [];

  /** @type {OptChar[]} */
  const withArg = [];

  /** @type {RegExpExecArray | null} */
  let m;

  const scanner = /([a-zA-Z0-9]):?/g;
  while (m = scanner.exec(optstring), m) {
    if (m[0].length === 2) {
      withArg.push(/** @type {OptChar} */ (m[1]));
    } else {
      flags.push(/** @type {OptChar} */ (m[1]));
    }
  }

  return { flags, withArg };
}

/**
 * @param {string[]} argv
 * @param {string} optstring
 * @param {number} [optind=1]
 * @return {Generator<{opt: OptChar | undefined, optind: number, optarg: string | undefined}, void, unknown>}
 */
export function* getopt(argv, optstring, optind = 1) {
  const { flags, withArg } = parseOptstring(optstring);

  const flagsPattern = flags.length > 0 ? `[${flags.join('')}]*` : '';
  const withArgPattern = withArg.length > 0 ? `[${withArg.join('')}]` : '';

  const re = new RegExp(`^-(${flagsPattern})((${withArgPattern})(.*))?$`);

  while (optind < argv.length) {
    const arg = argv[optind];

    if (arg.length === 1 && arg === "-") {
      yield { opt: undefined, optind, optarg: undefined };
      break;
    }

    if (arg === "--") {
      yield { opt: undefined, optind: optind + 1, optarg: undefined };
      break;
    }

    const m = arg.match(re);
    if (!m) {
      yield { opt: undefined, optind, optarg: undefined };
      return;
    }

    const [, flagsPart,, withArgPart, optargPart] = m;

    if (flagsPart) {
      for (const opt of flagsPart) {
        yield { opt: /** @type {OptChar} */ (opt), optind, optarg: undefined };
      }
    }

    if (withArgPart) {
      const opt = /** @type {OptChar} */ (withArgPart);

      if (optargPart) {
        yield { opt, optind, optarg: optargPart };
      } else {
        const optarg = argv[optind + 1];
        if (optarg === undefined) {
          yield { opt: "?", optind, optarg: undefined };
          return;
        }
        yield { opt, optind, optarg };
        optind += 1;
      }
    }

    optind += 1;
  }
}

