import { ethers } from 'ethers';

const LENS_HUB_ABI = "./abis/lens-hub-contract-abi";
const LENS_PERIPHERY_ABI = "./abis/lens-periphery-data-provider";
const MUMBAI_RPC_URL = "https://rpc-mumbai.matic.today";
const provider = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);

export const LENS_HUB_CONTRACT = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
export const LENS_PERIPHERY_CONTRACT = "0xD5037d72877808cdE7F669563e9389930AF404E8";

// lens contract info can all be found on the deployed
// contract address on polygon.
export const lensHub = new ethers.Contract(LENS_HUB_CONTRACT, LENS_HUB_ABI, provider );

export const lensPeriphery = new ethers.Contract(
  LENS_PERIPHERY_CONTRACT,
  LENS_PERIPHERY_ABI,
  provider
);
