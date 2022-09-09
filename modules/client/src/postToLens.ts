import { gql } from "@apollo/client/core";
import { BigNumber, utils } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { apolloClient } from "./apollo";
import { CREATE_POST_TYPED_DATA } from "./gqlQueries";
import { pollUntilIndexed } from "./poller";
import { Metadata } from "./publication";
import { uploadToIpfs } from "./ipfs";
import { lensHub } from "./lensHub";
import { generateChallenge } from "./apollo";


const PROFILE_ID = "0x1006";

//TODO typings
const createPostTypedData = (createPostTypedDataRequest: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_POST_TYPED_DATA),
    variables: {
      request: createPostTypedDataRequest,
    },
  });
};

export const login = async (address: string, signMessage: any) => {
  // request a challenge from the server
  const challengeResponse = await generateChallenge(address);

  // sign the text with the wallet
  signMessage({ message: challengeResponse.data.challenge.text});
};

const uploadFile = async () => {};

export const createPost = async (address: string, signMessage: any) => {

  /*
  return;
  const ipfsResult = await uploadToIpfs<Metadata>({
    version: "1.0.0",
    metadata_id: uuidv4(),
    description: "Description",
    content: "Content",
    external_url: null,
    image: null,
    imageMimeType: null,
    name: "Name",
    attributes: [],
    media: [
      // {
      //   item: "https://scx2.b-cdn.net/gfx/news/hires/2018/lion.jpg",
      //   // item: "https://assets-global.website-files.com/5c38aa850637d1e7198ea850/5f4e173f16b537984687e39e_AAVE%20ARTICLE%20website%20main%201600x800.png",
      //   type: "image/jpeg",
      // },
    ],
    appId: "testing123",
  });
  console.log("create post: ipfs result", ipfsResult);

  // hard coded to make the code example clear
  const createPostRequest = {
    profileId,
    contentURI: "ipfs://" + ipfsResult,
    collectModule: {
      freeCollectModule: { followerOnly: true },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

  const result = await createPostTypedData(createPostRequest);
  console.log("create post: createPostTypedData", result);

  const typedData = result.data.createPostTypedData.typedData;
  console.log("create post: typedData", typedData);

  const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
  console.log("create post: signature", signature);

  const { v, r, s } = utils.splitSignature(signature);

  const tx = await lensHub.postWithSig({
    profileId: typedData.value.profileId,
    contentURI: typedData.value.contentURI,
    collectModule: typedData.value.collectModule,
    collectModuleInitData: typedData.value.collectModuleInitData,
    referenceModule: typedData.value.referenceModule,
    referenceModuleInitData: typedData.value.referenceModuleInitData,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline,
    },
  });
  console.log("create post: tx hash", tx.hash);

  console.log("create post: poll until indexed");
  const indexedResult = await pollUntilIndexed(tx.hash);

  console.log("create post: profile has been indexed", result);

  const logs = indexedResult.txReceipt.logs;

  console.log("create post: logs", logs);

  const topicId = utils.id(
    "PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)"
  );
  console.log("topicid we care about", topicId);

  const profileCreatedLog = logs.find((l: any) => l.topics[0] === topicId);
  console.log("create post: created log", profileCreatedLog);

  let profileCreatedEventLog = profileCreatedLog.topics;
  console.log("create post: created event logs", profileCreatedEventLog);

  const publicationId = utils.defaultAbiCoder.decode(["uint256"], profileCreatedEventLog[2])[0];

  console.log("create post: contract publication id", BigNumber.from(publicationId).toHexString());
  console.log(
    "create post: internal publication id",
    profileId + "-" + BigNumber.from(publicationId).toHexString()
  );

  return result.data;
  */
};
