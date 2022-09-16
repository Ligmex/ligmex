import { useEffect, useState } from "react";
import {
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core"
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import {
  useConnect,
  useAccount,
  useSignMessage,
  useSignTypedData,
  useContractWrite
} from 'wagmi'

import { SceneComponent } from "./Scene";
import { AccessToken, AuthenticateResponse } from "../utils";

import { addConnectWalletButton } from "../things/connectWallet";

import { addLoginButton, addNewPostButton } from "../things/newPost";


import LENS_HUB_ABI from "../abis/lens-hub-contract-abi.json";
import { createTrendingCorner } from "src/things/trendingCorner";
import { createStartVideoStreamButton, createVideoStreamDisplay } from "src/things/startVideoStream";

const LENS_HUB_CONTRACT = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
const LENS_PERIPHERY_CONTRACT = "0xD5037d72877808cdE7F669563e9389930AF404E8";


SceneLoader.RegisterPlugin(new GLTFFileLoader());

export const Home = () => {

  let globalScene: Scene;
  const [newFile, setNewFile] = useState<any>();
  const [startVideoStream, setStartVideoStream] = useState(false);
  const [accessToken, setAccessToken] = useState({
    accessToken: localStorage.getItem("ACCESS_TOKEN"),
    refreshToken: localStorage.getItem("REFREH_TOKEN"),
  } as AccessToken)
  
  useEffect(() => {
    if (!globalScene || !newFile) return;
    SceneLoader.LoadAssetContainer("file:", newFile, globalScene, (container) => {
      console.log("loading scene container");
      container.meshes[0].scaling = new Vector3(0.05, 0.05, -0.05);
      container.addAllToScene();
    });
  }, [newFile]);

  useEffect(() => {
    if (!globalScene || !startVideoStream) return;
   
    createVideoStreamDisplay(globalScene);
  })

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount()
  const { error: loginError, isLoading: isLoadingLoginMessage, signMessageAsync: signLogin } = useSignMessage();

  const { error: contractWriteError, write: lenshubPostWithSig, isLoading: isPostWithSigLoading } = useContractWrite({
    addressOrName: LENS_HUB_CONTRACT,
    contractInterface: LENS_HUB_ABI.abi,
    functionName: 'postWithSig',
    mode: 'recklesslyUnprepared',
    onMutate({ args, overrides }) {
      console.log('Mutate', { args, overrides })
    },
    onError(error) {
      console.log(error);
    }
  });

  const { error: createPostError, isLoading: isLoadingCreatePostMessage, signTypedDataAsync: signCreatePost } = useSignTypedData({
    onError(error) {
      console.log(error)
    },
  })

  const onSceneReady = (scene: Scene) => {
    globalScene = scene;
    
    createTrendingCorner(scene);

    addConnectWalletButton(scene, {
      isConnected,
      address: address || "",
      connect,
      connectors,
      error,
      isLoading,
      pendingConnector
    });

    if (isConnected && address) {
      createStartVideoStreamButton(scene, setStartVideoStream);
      addLoginButton(scene, setAccessToken, {
        address,
        signer: signLogin,
        error: loginError,
        isLoading: isLoadingLoginMessage,
      });
      addNewPostButton(scene, {
        address,
        signer: signCreatePost,
        error: createPostError,
        isLoading: isLoadingCreatePostMessage,
        lenshubPostWithSig,
      },  setNewFile);
    }

    try {
      if ("xr" in window.navigator) {
        scene.createDefaultXRExperienceAsync().then(
          (xrexp: any) => {
            if (xrexp.baseExperience) {
              xrexp.teleportation.attach();
              scene.onDataLoadedObservable.addOnce(
                (scene: Scene) => {
                  const ground = scene.getMeshByName("ground");
                  xrexp.teleportation.addFloorMesh(ground!);
                });
            };
          });

      }
    } catch (e) {
      console.log(e);
    }
  };

  const onRender = (scene: Scene) => {
    // console.log("hello");
    // scene.render(false);
  };

  return (
    <SceneComponent
      adaptToDeviceRatio
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
      id="my-canvas"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
