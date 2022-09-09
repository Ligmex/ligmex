import axios from "axios";

/**
 *
 * @param data - Data to upload to ipfs
 * @returns ipfs hash id
 */
export const uploadToIpfs = async <T>(data: T): Promise<string> => {
  try {
    const authToken = "abc123"; // TODO: ask user for auth token
    const upload = await axios({
      url: `${window.location.origin}/ipfs`, 
      method: "POST",
      data,
      headers: {
        "content-type": "application/octet-stream",
        "authorization": `Basic ${btoa(`ligmex:${authToken}`)}`,
      }
    });
    const id = upload?.data || "";
    return id;
  } catch (e){
    throw e;
  }
};

export default uploadToIpfs;

/*
import { create } from "ipfs-http-client";

const authToken = AUTH_TOKEN;

if (!authToken) {
  throw new Error("No Auth token");
}

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${btoa(`admin:${authToken}`)}`,
  },
});

export const uploadIpfs = async <T>(data: T) => {
  const result = await client.add(JSON.stringify(data));

  console.log("upload result ipfs", result);
  return result;
};
*/
