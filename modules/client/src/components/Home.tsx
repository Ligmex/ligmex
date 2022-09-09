import { useEffect } from "react";
import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core"
import { useConnect, useAccount, useSignMessage } from 'wagmi'

import { SceneComponent } from "./Scene";
import { AuthenticateResponse } from "../utils";

import { addConnectWalletButton } from "../things/connectWallet";
import { authenticate } from "../apollo";
import { addLoginButton, addNewPostButton } from "../things/newPost";

export const Home = () => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount()
  const { error: signerError, isLoading: isLoadingSignMessage, signMessage } = useSignMessage({
    async onSuccess(sig: any, variables: any) {
      // const recoveredAddress = verifyMessage(variables.message, sig)
      // console.log(recoveredAddress);
      if (address && sig) {
        const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
        console.log(jwtTokens);
        localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
        localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
      }
    },
  });

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
        signMessage,
        signerError,
        isLoadingSignMessage
      });
      addNewPostButton(scene, {
        address,
        signMessage,
        signerError,
        isLoadingSignMessage
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
