import pino from "pino";

import { env } from "./env";

export const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const logger = pino({
  level: env.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname,module",
      messageFormat: `[{module}] {msg}`,
      translateTime: true,
    },
  },
});

// Convert between utf8-encoded strings and Uint8Arrays
// A la https://stackoverflow.com/a/43934805
export const strToArray = (str: string): Uint8Array => {
  const utf8Encoded = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8Encoded.split("").map(c => c.charCodeAt(0)));
};
export const arrToString = (arr: Uint8Array): string => {
  const utf8String = Array.from(arr).map(item => String.fromCharCode(item)).join("");
  return decodeURIComponent(escape(utf8String));
};

// Sigs copied from https://en.wikipedia.org/wiki/List_of_file_signatures
export const getContentType = (content: Buffer): string => {
  const fmtSig = str => Buffer.from(str.replace(/ /g, ""), "hex");
  for (const [key, val] of Object.entries({
    "application/pdf": [
      fmtSig("25 50 44 46 2d"),
    ],
    "image/gif": [
      fmtSig("47 49 46 38 37 61"),
      fmtSig("47 49 46 38 39 61"),
    ],
    "image/jpg": [
      fmtSig("FF D8 FF DB"),
      fmtSig("FF D8 FF E0"),
      fmtSig("FF D8 FF EE"),
      fmtSig("FF D8 FF E1"),
    ],
    "image/mpg": [
      fmtSig("00 00 01 BA"),
      fmtSig("00 00 01 B3"),
    ],
    "image/png": [
      fmtSig("89 50 4E 47 0D 0A 1A 0A"),
    ],
    "image/tif": [
      fmtSig("49 49 2A 00"),
      fmtSig("4D 4D 00 2A"),
    ],
    "video/mp4": [
      fmtSig("00 00 00 14 66 74 79 70 6d 70 34 31"),
      fmtSig("00 00 00 18 66 74 79 70 6d 70 34 32"),
      fmtSig("00 00 00 20 66 74 79 70 69 73 6F 6D"),
    ],
    "model/gltf-binary": [
      fmtSig("67 6C 54 46"),
    ],
  })) {
    if (val.some(sig =>
      content.length >= sig.length && content.compare(sig, 0, sig.length, 0, sig.length) === 0
    )) {
      return key;
    }
  }
  return "unknown";
};
