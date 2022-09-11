import { useEffect, useState } from "react";
import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core"
import { useConnect, useAccount, useSignMessage, useSignTypedData } from 'wagmi'

import { SceneComponent } from "./Scene";
import { AccessToken, AuthenticateResponse } from "../utils";

import { addConnectWalletButton } from "../things/connectWallet";
import { authenticate } from "../lensApi";
import { addLoginButton, addNewPostButton } from "../things/newPost";
import { verifyMessage } from "ethers/lib/utils";

export const Home = () => {
  const [accessToken, setAccessToken ] = useState({
    accessToken: localStorage.getItem("ACCESS_TOKEN"),
    refreshToken: localStorage.getItem("REFREH_TOKEN"),
  } as AccessToken)

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount()
  const { error: loginError, isLoading: isLoadingLoginMessage, signMessage: signLogin } = useSignMessage({
    async onSuccess(sig: any, variables: any) {
      console.log(variables)
      const recoveredAddress = verifyMessage(variables.message, sig)
      if (address === recoveredAddress && sig) {
        const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
        console.log("Setting access token");
        setAccessToken(jwtTokens);
        console.log(jwtTokens);
        localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
        localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
      }
    },
  });

  useSignTypedData()
  const {error: createPostError, isLoading: isLoadingCreatePostMessage, signTypedDataAsync: signCreatePost} = useSignTypedData({
    onError(error){
      console.log(error)
    },
  })

  console.log(createPostError);
  const onSceneReady = (scene: Scene) => {
    const camera = new ArcRotateCamera(
      "camera1", // name
      0, // Math.PI, // alpha
      0, // Math.PI / 2.0, // beta
      2, // radius
      new Vector3(10, 10, -1), // target
      scene
    );
    camera.setTarget(Vector3.Zero());

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
      addLoginButton(scene, {
        address,
        signer: signLogin,
        error: loginError,
        isLoading: isLoadingLoginMessage,
      });
      addNewPostButton(scene, {
        address,
        signer: signCreatePost,
        error: createPostError,
        isLoading: isLoadingCreatePostMessage
      });
    }

    try {
      if ((navigator as any).xr) {
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
    } catch(e) {
      console.log(e);
    }
  };

  const onRender = (scene: Scene) => {
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
