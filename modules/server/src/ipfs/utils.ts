import { create } from "ipfs-http-client";

import { env } from "../env";

export const ipfs = create({ url: `http://${env.ipfsUrl}` });
