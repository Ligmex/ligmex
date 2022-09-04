import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { utils } from "ethers";
import omitDeep from 'omit-deep';

let accounts: Array<any> = [];

let chainId: any;

// Create a connector
const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
  qrcodeModal: QRCodeModal,
});

// Subscribe to connection events
connector.on("connect", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get provided accounts and chainId
  const { a, cid } = payload.params[0];
  accounts = a;
  chainId = cid
});

connector.on("session_update", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get updated accounts and chainId
  const { a, cid } = payload.params[0];
  accounts = a;
  chainId = cid;
});

connector.on("disconnect", (error, payload) => {
  if (error) {
    throw error;
  }

  // Delete connector
});

export const connect = () => {
  // Check if connection is already established
  if (!connector.connected) {
    // create new session
    connector.createSession();
  }
}

export const getAddressFromSigner = () => {
  return accounts[0];
}

export const signText = (text: string) => {
  const msgParams = [
   accounts[0],
   utils.keccak256("\x19Ethereum Signed Message:\n" + text)
  ];
  return connector.signMessage(msgParams);
}

export const signedTypeData = async (
  domain: any, // TypedDataDomain,
  types: Record<string, any[]>, // TypedDataField[]>,
  value: Record<string, any>
) => {
  // remove the __typedname from the signature!
  const typedData = omitDeep({
    domain,
    types,
    value
  }, "__typedname");

  const msgParams = [
    accounts[0],
    JSON.stringify(typedData)
  ];
  return connector.signTypedData(msgParams);
}; 
