import { useEffect, useState } from "react";
import {
  AbstractMesh,
  FreeCamera,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useSignMessage,
  useSignTypedData,
  useContractWrite
} from 'wagmi'

import { SceneComponent } from "./Scene";
import { AccessToken, getFollowing, getPostsByProfile, getProfile, SceneState } from "../utils";


import LENS_HUB_ABI from "../abis/lens-hub-contract-abi.json";
import { addNewPostButton } from "../things/newPost";
import { createTrendingCorner } from "../things/trendingCorner";
import { ctrlPanelMaker } from "../things/ctrlPanel";
import { galleryMaker } from "../things/gallery";
import { profileMaker } from "../things/profile";
import {
  addLoginButton,
  addConnectWalletButton,
  createUploadFileView,
  createStartVideoStreamButton,
  createVideoStreamDisplay,
  getPosts,
  getProfileByOwner,
} from "../utils";
import { PROFILE_FRAME_POSITION, PROFILE_FRAME_VIEW_POSITION, PROFILE_FRAME_VIEW_ROTATION, TRENDING_VIEW_POSITION } from "../utils/cameraConstants";

const LENS_HUB_CONTRACT = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
const LENS_PERIPHERY_CONTRACT = "0xD5037d72877808cdE7F669563e9389930AF404E8";


SceneLoader.RegisterPlugin(new GLTFFileLoader());
const storedProfile = localStorage.getItem("profileId") || null;

export const Home = () => {

  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [sceneState, setSceneState] = useState({
    profileToLoad: storedProfile? storedProfile : "",
    camera: storedProfile? {
      position: PROFILE_FRAME_VIEW_POSITION,
      rotation: PROFILE_FRAME_VIEW_ROTATION
    } : null
  } as SceneState);
  const [accessToken, setAccessToken] = useState({
    accessToken: localStorage.getItem("ACCESS_TOKEN"),
    refreshToken: localStorage.getItem("REFREH_TOKEN"),
  } as AccessToken);
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { error: loginError, isLoading: isLoadingLoginMessage, signMessageAsync: signLogin } = useSignMessage();
  const { error: contractWriteError, write: lenshubPostWithSig, isLoading: isPostWithSigLoading } = useContractWrite({
    addressOrName: LENS_HUB_CONTRACT,
    contractInterface: LENS_HUB_ABI.abi,
    functionName: 'postWithSig',
    mode: 'recklesslyUnprepared',

    onError(error) {
      console.log(error);
    }
  });
  const { error: createPostError, isLoading: isLoadingCreatePostMessage, signTypedDataAsync: signCreatePost } = useSignTypedData({
    onError(error) {
      console.log(error)
    },
  });

  const onSceneReady = (scene: Scene) => {

    ctrlPanelMaker(scene, new Vector3(10, 0, 10), setSceneState);

    const camera = scene.getCameraByName("fpsCamera") as FreeCamera;
    if (camera) {
      camera.attachControl();

      camera.applyGravity = true;
      camera.checkCollisions = true;

      camera.ellipsoid = new Vector3(1, 1, 1);

      camera.minZ = 0.45;
      camera.speed = 0.75;
      camera.angularSensibility = 4000;

      camera.keysUpward = [32];
      camera.keysUp = [87];
      camera.keysLeft = [65];
      camera.keysDown = [83];
      camera.keysRight = [68];

      if (sceneState?.camera?.position) {
        console.log("setting camera position and rotation", sceneState.camera)
        camera.position = sceneState.camera.position;
        camera.rotation = sceneState.camera.rotation;
      }

    }

    if (sceneState?.newFileToLoad) {
      createUploadFileView(scene, sceneState.newFileToLoad);
    }

    if (sceneState?.videoStream) {
      createVideoStreamDisplay(scene);
    }

    try {
      setTimeout(async () => {
        if (sceneState?.profileToLoad) {
          console.log(sceneState.profileToLoad);
          const profilePost = await getPostsByProfile(sceneState.profileToLoad);
          const profile = await getProfile(sceneState.profileToLoad);
          const following = await getFollowing(profile.ownedBy);
          if (profilePost && profile) {
            console.log("showing posts by profile")
            profileMaker(scene, PROFILE_FRAME_POSITION, 4, profilePost, profile, following);
            // galleryMaker(scene,  , 4, profilePost);
          }
        }
        
        const latestPosts = await getPosts(10);
        if (latestPosts) {
          // galleryMaker(scene, TRENDING_VIEW_POSITION, 4, latestPosts);
          createTrendingCorner(scene, TRENDING_VIEW_POSITION, latestPosts);
        }
        
      })
    } catch (e) {
      console.log(e);
    }


    addConnectWalletButton(scene, {
      isConnected,
      address: address,
      connect,
      connectors,
      error,
      isLoading,
      pendingConnector,
      disconnect
    });

    if (isConnected && address) {

      createStartVideoStreamButton(scene, setSceneState);
      try {
        setTimeout(async () => {
          const profileId = (await getProfileByOwner(address))[0]?.id;
          const myPosts = await getPostsByProfile(profileId);
          if (myPosts && myPosts.length > 0) {
            // galleryMaker(scene, new Vector3(10, 0, -10), 4, myPosts);
          }
          addLoginButton(scene, setAccessToken, {
            address,
            signer: signLogin,
            error: loginError,
            isLoading: isLoadingLoginMessage,
          });
          addNewPostButton(scene, profileId, {
            address,
            signer: signCreatePost,
            error: createPostError,
            isLoading: isLoadingCreatePostMessage,
            lenshubPostWithSig,
          }, setSceneState);
        })
      } catch (e) {
        console.log(e);
      }
    }

    try {
      if ("xr" in window.navigator) {
        console.log("creating xr");
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
    } finally {

      // console.log(camera.position, camera.rotation);
      scene.meshes.forEach((mesh: AbstractMesh) => {
        mesh.checkCollisions = true;
      })
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
