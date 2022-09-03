import {
  ApolloClient,
  InMemoryCache,
  gql,
} from '@apollo/client'

import { EXPLORE_PUBLICATIONS, GET_PROFILE } from "./gqlQueries";

// const TESTNET_URL = 'https://api-mumbai.lens.dev/';
const MAINNET_URL = 'https://api.lens.dev/';

const apolloClient= new ApolloClient({
  uri: MAINNET_URL,
  cache: new InMemoryCache(),
})

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

export const explorePublications = async (explorePublicationQueryRequest: any) => {
   const response = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: explorePublicationQueryRequest
    },
  });

  const publications = response.data.explorePublications.items;
  console.log('Lens Publication Data', publications);

  publications.forEach((publication: any) => {
    switch (publication.__typename) {
      case "Mirror":
        break;
      case "Post":
        console.log(
          publication.metadata.content,
          publication.metadata.media.length
        );
        break;
      case "Comment":
        console.log(
          publication.mainPost.metadata.content,
          publication.mainPost.metadata.media.length
        );
        break;
    };
    console.log(publication.__typename);
  });
}
