/**
 * @param {string[]} argv
 * @param {string} optstring
 * @return {Generator<{opt: OptChar | undefined, optind: number, optarg: string | undefined}, void, unknown>}
 */
export function getopt(argv: string[], optstring: string): Generator<{
    opt: OptChar | undefined;
    optind: number;
    optarg: string | undefined;
}, void, unknown>;
export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Letter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
export type OptChar = Digit | Letter | Uppercase<Letter> | "?";
