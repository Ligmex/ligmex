import { gql } from '@apollo/client/core';

import { apolloClient } from "./apollo";
import {
  AUTHENTICATION,
  EXPLORE_PUBLICATIONS,
  GET_CHALLENGE,
  GET_PROFILE,
  GET_PUBLICATION_BY_PROFILE,
} from "./gqlQueries";

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

export const getMyPosts = async (profileId: string): Promise<any> => {
  const response = await apolloClient.query({
    query: gql(GET_PUBLICATION_BY_PROFILE),
    variables: {
      request: {
        profileId: profileId,
        publicationTypes: ["POST"],
        limit: 10
      }
    }
  })
  return response;
}

export const getPosts = async (LIMIT = 10) => {
   const embededRes = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: {
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        metadata: {
          mainContentFocus: ["EMBED"]
        },
        limit: LIMIT,
      }
    },
  });
  const embeded = embededRes.data.explorePublications.items
  let videos = [] as any[];
  if (embeded.length < 10) {
    const videoRes = await apolloClient.query({
      query: gql(EXPLORE_PUBLICATIONS),
      variables: {
        request: {
          sortCriteria: "LATEST",
          publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
          metadata: {
            mainContentFocus: ["VIDEO", "IMAGE"]
          },
          limit: LIMIT - embeded.length,
        }
      },
    });
    videos.push(...videoRes.data.explorePublications.items);
  }
  return [...embeded, ...videos];
};

export const getProfile = async (profileId: string) => {
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


