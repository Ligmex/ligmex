import axios from "axios";

/**
 *
 * @param data - Data to upload to ipfs
 * @returns ipfs hash id
 */
export const uploadToIpfs = async <T>(data: T): Promise<string> => {
  try {
    const upload = await axios({
      url: "https://shivhendo.com/ipfs", 
      method: "POST",
      data,
      headers: { "content-type": "application/octet-stream" }
    });

    if (upload.status === 200) {
      console.log(upload.data);
      return upload?.data;
    } else {
      console.log("Unsuccessful upload");
      throw upload.status;
    }
    // const { id }: { id: string } = upload?.data;
  } catch (e){
    console.log("failed");
    throw e;
  }
};

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
