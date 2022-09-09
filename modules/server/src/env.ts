import path from "path";

export type Env = {
  vipToken: string;
  ipfsUrl: string;
  maxUploadSize: string;
  logLevel: string;
  port: number;
  prodMode: boolean;
}

export const env: Env = {
  vipToken: process?.env?.LIGMEX_VIP_TOKEN || "abc123",
  ipfsUrl: process?.env?.IPFS_URL || "http://ipfs:5001",
  maxUploadSize: process?.env?.BLOG_MAX_UPLOAD_SIZE || "100mb",
  logLevel: process?.env?.BLOG_LOG_LEVEL || "info",
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
