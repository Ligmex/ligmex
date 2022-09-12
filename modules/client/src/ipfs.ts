import axios from "axios";
import { create } from 'ipfs-http-client';

const projectId = localStorage.getItem('INFURA_PROJECT_ID');
const secret = localStorage.getItem('INFURA_SECRET');

if (!projectId || !secret) {
  throw new Error('Must define INFURA_PROJECT_ID and INFURA_SECRET in the .env to run this');
}

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${btoa(`${projectId}:${secret}`)}`,
    //`Basic ${Buffer.from(`${projectId}:${secret}`, 'utf-8').toString('base64')}`,
  },
});

export const uploadViaInfura = async <T>(data: T) => {
  const result = await client.add(data as any);
  // const result = await client.add(JSON.stringify(data));

  console.log('upload result ipfs', result);
  return result.path;
};

/**
 * @param data - Data to upload to ipfs
 * @returns ipfs hash id
 */
const upload = async <T>(data: T): Promise<string> => {
  try {
    const vipToken = "abc123"; // TODO: ask user for auth token
    const upload = await axios({
      url: `${window.location.origin}/ipfs`, 
      method: "POST",
      data,
      headers: {
        "content-type": "application/octet-stream",
        "authorization": `Basic ${btoa(`ligmex:${vipToken}`)}`,
      }
    });

    if (upload.status === 200) {
      console.log(upload.data);
      return upload?.data;
    } else {
      console.log("Unsuccessful upload", upload);
      throw upload.status;
    }

  } catch (e){
    throw e;
  }
};

/**
 * @param ipfs hash id
 * @returns content string of data
 */
const download = async (hash: string): Promise<string> => {
  const res = await axios({
    url: `${window.location.origin}/ipfs/${hash.replace(/^\/?ipfs\//, "")}`, 
    method: "GET",
    headers: { "content-type": "application/octet-stream" }
  });
  console.log(`ipfs hello world res`, res);
  return res?.data || "";
};

export const ipfs = { download, upload, uploadViaInfura };

/* Test upload & download
(async () => {
  const testText = `hello again, world! It's ${(new Date()).toTimeString()}`
  const hash = await upload(testText);
  console.log(`Got hash: ${hash}`);
  const response = await download(hash);
  if (testText !== response) {
    console.error(`Failed to upload & download test text: ${testText} !== ${response}`);
  } else {
    console.log(`Successfully uploaded & downloaded test text: ${testText}`);
  }
})()
*/
