import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  from,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';

import {
  AUTHENTICATION,
  EXPLORE_PUBLICATIONS,
  GET_CHALLENGE,
  GET_PROFILE,
} from "./gqlQueries";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const TESTNET_URL = 'https://api-mumbai.lens.dev/';
// const MAINNET_URL = 'https://api.lens.dev/';

const httpLink = new HttpLink({
  uri: TESTNET_URL,
  fetch,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  console.log('jwt token:', token);

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      'x-access-token': token ? `Bearer ${token}` : '',
    },
  });

  // Call the next link in the middleware chain.
  return forward(operation);
});

export const apolloClient= new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
})

export const generateChallenge = (address: string) => {
  return apolloClient.query({
    query: gql(GET_CHALLENGE),
    variables: {
      request: {
        address,
      },
    },
  });
};

export const authenticate = (address: string, signature: string) => {
  return apolloClient.mutate({
    mutation: gql(AUTHENTICATION),
    variables: {
      request: {
        address,
        signature,
      },
    },
  });
};

// 4102 - "bohendo"
export const getGallery = async (profileId: string) => {
   const response = await apolloClient.query({
    query: gql(GET_PROFILE),
    variables: {
      request: {
        profileId: profileId,
      }
    },
  });
  return response.data.profile;
};

export const getPost = async () => {
   const response = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: {
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        limit: 1
      }
    },
  });
  return response.data.explorePublications.items[0]?.metadata.content;
};

export const getPosts = async () => {
   const response = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: {
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        limit: 10
      }
    },
  });
  return response.data.explorePublications.items;
};

export const explorePublications = async (explorePublicationQueryRequest: any) => {
   const response = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: explorePublicationQueryRequest
    },
  });

  return response.data.explorePublications.items
}
