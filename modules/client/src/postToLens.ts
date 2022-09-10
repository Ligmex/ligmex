import { gql } from "@apollo/client/core";
import { BigNumber, utils } from "ethers";
import { v4 as uuid } from "uuid";
import { apolloClient } from "./apollo";
import { CREATE_POST_TYPED_DATA } from "./gqlQueries";
import { pollUntilIndexed } from "./poller";
import { Metadata } from "./publication";
import { ipfs } from "./ipfs";
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

export const getPostMetadata = async () => {
};

export const createPost = async (metaDataIpfsHash: string) => {

  const createPostRequest = {
    profileId: '0x458f',
    contentURI: metaDataIpfsHash,
    collectModule: {
      freeCollectModule: { followerOnly: false },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

  const result = await createPostTypedData(createPostRequest);
  console.log("create post: createPostTypedData", result);

  /*


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
