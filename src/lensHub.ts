import { ethers } from 'ethers';

import LENS_HUB_ABI from "./abis/lens-hub-contract-abi.json";
import LENS_PERIPHERY_ABI from "./abis/lens-periphery-data-provider.json";

// const MUMBAI_RPC_URL = "https://rpc-mumbai.matic.today";
const MUMBAI_RPC_URL = `${window.location.origin}/polygon`;
const provider = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
console.log(provider);

(async () => {
  provider.getBalance("0xada083a3c06ee526F827b43695F2DcFf5C8C892B").then((res: any) => {
    console.log(`Successfully fetched ada balance: ${JSON.stringify(res, null, 2)}`);
  }).catch((err: any) => {
    console.log(`Failed to fetch ada balance: ${err?.message || "unknown error"}`);
  });
})()

//console.log(`LENS_HUB_ABI: ${JSON.stringify(LENS_HUB_ABI)}`)

export const LENS_HUB_CONTRACT = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
export const LENS_PERIPHERY_CONTRACT = "0xD5037d72877808cdE7F669563e9389930AF404E8";

// lens contract info can all be found on the deployed
// contract address on polygon.
export const lensHub = new ethers.Contract(LENS_HUB_CONTRACT, LENS_HUB_ABI.abi, provider );

export const lensPeriphery = new ethers.Contract(
  LENS_PERIPHERY_CONTRACT,
  LENS_PERIPHERY_ABI.abi,
  provider
);
