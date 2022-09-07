import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { apolloClient } from './apollo';

const MUMBAI_RPC_URL = `${window.location.origin}/polygon`;

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== 42) {console.log("Unknown Chain"); return null}
        return { http: MUMBAI_RPC_URL }
      },
    }),
  ]
);

const connectors = () => {
  return [
    new WalletConnectConnector({
      chains,
      options: { qrcode: true, rpc: { [42]: MUMBAI_RPC_URL } }
    })
  ];
};

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </WagmiConfig>
  );
};

