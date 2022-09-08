import { getAddressFromSigner, signText } from './walletConnect';
import { generateChallenge } from "./apollo";


export const login = async (address: string, signMessage: any) => {

  console.log('login: address', address);

  // we request a challenge from the server
  const challengeResponse = await generateChallenge(address);

  // sign the text with the wallet
  signMessage({ message: challengeResponse.data.challenge.text});

  // const accessTokens = await authenticate(address, signature);

  // setAuthenticationToken(accessTokens.data.authenticate.accessToken);

  // return accessTokens.data;
};
