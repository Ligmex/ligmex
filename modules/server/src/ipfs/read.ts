import iterateAll from "it-all";

import { getContentType, logger } from "../utils";

import { ipfs } from "./utils";

export type IpfsRead = {
  contentType: string;
  content: Buffer | string | string[] | object;
};

const log = logger.child({ module: "IpfsRouter" });

export const read = async (path: string): Promise<IpfsRead> => {

  // ls the given path to get some info about it
  const lsRes: string[] = [];
  let contentSize = 0;
  for await (const chunk of ipfs.ls(path, { timeout: 10000 })) {
    log.debug(`ls got a ${chunk.type} (size ${chunk.size}): "${chunk.name}" at path ${chunk.path}`);
    if (chunk.type === "file") {
      contentSize += chunk.size;
      if (chunk.name) {
        lsRes.push(chunk.name);
      }
    }
  }
  lsRes.sort((a: string, b: string): number => a.localeCompare(b));

  // If the given path resolves to a dir, return a list of the files it includes
  if (lsRes.length) {
    log.info(`Got ls result of ${lsRes.length} files`);
    return { contentType: "application/json", content: lsRes };
  }

  let content: Buffer;
  try {
    // If the given path isn't a dir, read it's contents into a buffer
    // from https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/cat.js#L92
    log.info(`Reading >= ${contentSize} bytes of content from ${path} into a buffer..`);
    content = Buffer.concat(await iterateAll(ipfs.cat(path, { timeout: 10000 })));
  } catch (e) {
    if (e.message.includes("this dag node is a directory")) {
      log.info(`Got ls result of ${lsRes.length} files`);
      return { contentType: "application/json", content: lsRes };
    }
    throw e;
  }

  // Try to determine the content type of the buffer we got
  let contentType = getContentType(content);
  if (contentType !== "unknown") {
    log.info(`Returning ${content.length} bytes of ${contentType} content`);
    return { contentType, content };
  }
  const text = content.toString("utf8");
  if (text.includes("\ufffd")) { // this codepoint replaces any invalid utf8 data
    contentType = "application/octet-stream";
    log.info(`Returning ${content.length} bytes of ${contentType} content, Starting with ${content.toString("hex").substr(0,8)}`);
    return { contentType, content };
  }
  try {
    const json = JSON.parse(text);
    contentType = "application/json";
    log.info(`Returning ${text.length} chars of ${contentType} content`);
    return { contentType, content: json };
  } catch (e) {
    if (text.startsWith("<?xml")) {
      if (text.includes("<svg")) {
        contentType = "image/svg+xml";
      } else {
        contentType = "application/xml";
      }
    } else {
      contentType = "text/plain";
    }
    log.info(`Returning ${text.length} chars of ${contentType} content`);
    return { contentType, content: text };
  }
};
