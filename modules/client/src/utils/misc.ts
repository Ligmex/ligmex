import axios from "axios";

export const omit = (object: { [key: string]: any }, name: string) => {
  delete object[name];
  return object;
};

export const getStandardUrl = (uri: string) => {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
  } else if (uri.split("/").length === 1) {
    return "https://lens.infura-ipfs.io/ipfs/" + uri;
  } else return uri;
}

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const result = await axios({
      url: `${window.location.origin}/api/auth`,
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        "authorization": `Basic ${btoa(`ligmex:${token}`)}`,
      }
    });
    if (!result?.data) {
      console.error(result);
    }
  } catch (e: any) {
    console.error(`VIP Token test failed: ${e.message}`);
    return false;
  }
  console.log(`validated token=${token}`);
  return true;
};
