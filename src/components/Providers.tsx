import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { publicProvider } from 'wagmi/providers/public'
import { apolloClient } from '../apollo';

global.Buffer = global.Buffer || require("buffer").Buffer
const MUMBAI_RPC_URL = `${window.location.origin}/polygon`;

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== 80001) {console.log("Unknown Chain", chain); return null}
        return { http: MUMBAI_RPC_URL }
      },
    }),
  ]
);

const connectors = () => {
  return [
    new WalletConnectConnector({
      chains,
      options: { qrcode: true, rpc: { [80001]: MUMBAI_RPC_URL } }
    })
  ];
};

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

export const Providers = ({ children }: { children: ReactNode }) => {
  console.log("Chains: ", chains, "provider: ", provider);
  // console.log(wagmiClient);
  return (
    <WagmiConfig client={wagmiClient}>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </WagmiConfig>
  );
};

