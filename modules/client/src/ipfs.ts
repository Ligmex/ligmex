import axios from "axios";

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
    const id = upload?.data || "";
    return id;
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

export const ipfs = { download, upload };

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
