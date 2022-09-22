import { gql } from '@apollo/client/core';

import { apolloClient } from "./apollo";
import {
  AUTHENTICATION,
  EXPLORE_PUBLICATIONS,
  GET_CHALLENGE,
  GET_PROFILE,
  GET_PROFILE_ID,
  GET_PROFILE_BY_OWNER,
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

export const getProfileID = async (handle: string) => {
  const response = await apolloClient.query({
    query: gql(GET_PROFILE_ID),
    variables: {
      request: {
        handle: handle
      }
    },
  });
  console.log(response);
  return response.data?.profile?.id;
};

export const getProfileByOwner = async (address: string) => {
  const response = await apolloClient.query({
    query: gql(GET_PROFILE_BY_OWNER),
    variables: {
      request: {
        ownedBy: address,
        limit: 1
      },
    },
  });
  return response.data?.profiles?.items
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

export const getPostsByProfile = async (profileId: string): Promise<any> => {
  console.log(`Querring post by profile: ${profileId}`)
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
  return response.data?.publications?.items;
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


