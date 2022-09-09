import ipfsClient from "ipfs-client";

import { env } from "../env";

export const ipfs = ipfsClient({ http: `http://${env.ipfsUrl}` });
