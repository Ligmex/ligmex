import { gql } from "@apollo/client/core";
import { BigNumber, utils } from "ethers";
import { v4 as uuid } from "uuid";

import { apolloClient } from "./apollo";
import { CREATE_POST_TYPED_DATA } from "./gqlQueries";
import { pollUntilIndexed } from "./poller";
import { Metadata } from "./publication";
import { ipfs } from "./ipfs";
import { omit } from "./misc";

const PROFILE_ID = "0x47a8";

//TODO typings
const createPostTypedData = (createPostTypedDataRequest: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_POST_TYPED_DATA),
    variables: {
      request: createPostTypedDataRequest,
    },
  });
};

export const getPostMetadata = async () => {
};

export const createPost = async (
  metaDataIpfsHash: string,
  signTypedData: any,
  lenshubPostWithSig: any,
  profileId: string
  ) => {
    
  const createPostRequest = {
    profileId: profileId,
    contentURI: `ipfs://${metaDataIpfsHash}`,
    collectModule: {
      freeCollectModule: { followerOnly: false },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

  const result = await createPostTypedData(createPostRequest);

  const typedData = result.data.createPostTypedData.typedData;
  console.log("create post: typedData", typedData);
  
  console.log(signTypedData);
  console.log("calling");
  const signature = await signTypedData({
    domain: omit(typedData?.domain, '__typename'),
    types: omit(typedData?.types, '__typename'),
    value: omit(typedData?.value, '__typename')
  });  
  
  console.log(signature);
  const { v, r, s } = utils.splitSignature(signature);
  console.log(v,r,s);
  console.log(lenshubPostWithSig);

  // console.log(lensHub);
  const tx = await lenshubPostWithSig?.({recklesslySetUnpreparedArgs: {
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
  }});
  console.log(`create post: tx hash=${tx.hash}`);
  /*

  //console.log("create post: poll until indexed");
  //const indexedResult = await pollUntilIndexed(tx.hash);
  //console.log("create post: profile has been indexed", indexedResult);
  //const logs = indexedResult.txReceipt.logs;
  //console.log("create post: logs", logs);

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
