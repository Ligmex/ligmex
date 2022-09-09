import { ipfs } from "./utils";

export const rmPin = async (cid: string): Promise<string> => {
  const unpinnedCid = await ipfs.pin.rm(cid, { recursive: true });
  return `/ipfs/${unpinnedCid.toString()}`;
};
