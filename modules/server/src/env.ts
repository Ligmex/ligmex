import path from "path";

export type Env = {
  ipfsUrl: string;
  logLevel: string;
  maxUploadSize: string;
  port: number;
  prodMode: boolean;
  vipToken: string;
}

export const env: Env = {
  ipfsUrl: process?.env?.IPFS_URL || "http://ipfs:5001",
  logLevel: process?.env?.LIGMEX_LOG_LEVEL || "info",
  maxUploadSize: process?.env?.LIGMEX_MAX_UPLOAD_SIZE || "10mb",
  port: parseInt(process?.env?.LIGMEX_PORT || "8080", 10),
  prodMode: process?.env?.LIGMEX_PROD === "true",
  vipToken: process?.env?.LIGMEX_VIP_TOKEN || "abc123",
};
