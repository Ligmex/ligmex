import { gql } from '@apollo/client/core';
import { Scene } from "@babylonjs/core";
import { Button } from "@babylonjs/gui";
import { verifyMessage } from "ethers/lib/utils";

import { apolloClient } from "./apollo";
import {
  CTRL_BUTTON_HEIGHT,
  CTRL_BUTTON_WIDTH,
} from "./constants";
import {
  AUTHENTICATION,
  EXPLORE_PUBLICATIONS,
  GET_CHALLENGE,
  GET_PROFILE,
  GET_PROFILE_ID,
  GET_PROFILE_BY_OWNER,
  GET_PUBLICATION_BY_PROFILE,
  GET_FOLLOWERS,
  GET_FOLLOWING,
} from "./gqlQueries";

////////////////////////////////////////
// Authentication & Login

export type AccessToken = {
   accessToken: string;
   refreshToken: string;
}

export type AuthenticateResponse = {
  data: {
   authenticate: AccessToken;
  }
}

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
    variables: { request: {
      address,
    } },
  });
};

const login = async (address: string, signMessage: any, setAccessToken: any) => {
    // request a challenge from the server
    const challengeResponse = await generateChallenge(address);
    // sign the text with the wallet
    const sig = await signMessage({ message: challengeResponse.data.challenge.text });
    console.log(`sig=${sig}`);
    const recoveredAddress = verifyMessage(challengeResponse.data.challenge.text, sig)
    if (address === recoveredAddress && sig) {
        const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
        console.log(`Setting access token to: access=${jwtTokens.accessToken} | refresh=${jwtTokens.refreshToken}`);
        setAccessToken(jwtTokens);
        localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
        localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
    }
};

export const addLoginButton = (
    scene: Scene,
    setAccessToken: any,
    connectorOptions: {
        address: string,
        error: any,
        signLogin: any,
        isLoading: any
    }
) => {
    const button = Button.CreateSimpleButton("newPost", "🔐 Login");
    button.width = CTRL_BUTTON_WIDTH;
    button.height = CTRL_BUTTON_HEIGHT;
    button.color = "white";
    button.background = "red";
    button.onPointerUpObservable.add(() => login(
      connectorOptions.address,
      connectorOptions.signLogin,
      setAccessToken,
    ));
    return button;
};

////////////////////////////////////////
// Lens Data Getters

export const getProfileID = async (handle: string) => {
  const response = await apolloClient.query({
    query: gql(GET_PROFILE_ID),
    variables: { request: {
      handle: handle
    } },
  });
  return response.data?.profile?.id;
};

export const getProfileByOwner = async (address: string) => {
  const response = await apolloClient.query({
    query: gql(GET_PROFILE_BY_OWNER),
    variables: { request: {
      ownedBy: address,
      limit: 1
    } },
  });
  return response.data?.profiles?.items
};

export const getPostsByProfile = async (profileId: string): Promise<any> => {
  const response = await apolloClient.query({
    query: gql(GET_PUBLICATION_BY_PROFILE),
    variables: { request: {
      profileId: profileId,
      publicationTypes: ["POST"],
      limit: 10
    } }
  })
  return response.data?.publications?.items;
};

export const getPosts = async (LIMIT = 10) => {
   const embededRes = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: { request: {
      sortCriteria: "LATEST",
      publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
      metadata: {
        mainContentFocus: ["EMBED"]
      },
      limit: LIMIT,
    } },
  });
  const embeded = embededRes.data.explorePublications.items
  let videos = [] as any[];
  if (embeded.length < 10) {
    const videoRes = await apolloClient.query({
      query: gql(EXPLORE_PUBLICATIONS),
      variables: { request: {
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        metadata: {
          mainContentFocus: ["VIDEO", "IMAGE"]
        },
        limit: LIMIT - embeded.length,
      } },
    });
    videos.push(...videoRes.data.explorePublications.items);
  }
  return [...embeded, ...videos];
};

export const getProfile = async (profileId: string) => {
   const response = await apolloClient.query({
    query: gql(GET_PROFILE),
    variables: { request: {
      profileId: profileId,
    } },
  });
  return response.data.profile;
};

export const getFollowers = async (profileId: string) => {
  const response = await apolloClient.query({
    query: gql(GET_FOLLOWERS),
    variables: { request: {
      profileId: profileId,
      limit: 10
    } }
  })
  return response.data.followers.items;
};

export const getFollowing = async (address: string) => {
  const response = await apolloClient.query({
    query: gql(GET_FOLLOWING),
    variables: { request: {
      address: address,
      limit: 10
    } }
  });
  return response.data.following.items;
};
