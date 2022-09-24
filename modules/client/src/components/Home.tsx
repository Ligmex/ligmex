import { useState } from "react";
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

import { AccessToken, getFollowing, getPostsByProfile, getProfile, SceneState } from "../utils";

import LENS_HUB_ABI from "../abis/lens-hub-contract-abi.json";
import { createTrendingCorner } from "../things/trendingCorner";
import { ctrlPanelMaker } from "../things/ctrlPanel";
import { galleryMaker } from "../things/gallery";
import { profileMaker } from "../things/profile";
import { addNewPostButton } from "../things/newPost";
import {
  createUploadFileView,
  createVideoStreamDisplay,
  getPosts,
} from "../utils";
import {
  PROFILE_FRAME_POSITION,
  CTRL_PANEL_VIEW_POSITION,
  PROFILE_FRAME_VIEW_ROTATION,
  TRENDING_CORNER_POSITION,
  TRENDING_VIEW_POSITION,
  TRENDING_VIEW_ROTATION,
} from "../utils/cameraConstants";

import { SceneComponent } from "./Scene";

const LENS_HUB_CONTRACT = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
// const LENS_PERIPHERY_CONTRACT = "0xD5037d72877808cdE7F669563e9389930AF404E8";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

export const Home = () => {
  const storedProfile = localStorage.getItem("ProfileID") || null;
  console.log(`Got profile from local storage: ${storedProfile}`);
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [sceneState, setSceneState] = useState({
    profileToLoad: storedProfile ? storedProfile : "",
    camera: storedProfile? {
      position: CTRL_PANEL_VIEW_POSITION,
      rotation: PROFILE_FRAME_VIEW_ROTATION
    } : {
      position: TRENDING_VIEW_POSITION,
      rotation: TRENDING_VIEW_ROTATION
    }
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

    ctrlPanelMaker(
      scene,
      new Vector3(10, 0, 10), // position
      {
        address,
        connect,
        connectors,
        disconnect,
        error: createPostError,
        isConnected,
        isLoading: isLoadingCreatePostMessage,
        lenshubPostWithSig,
        pendingConnector,
        signer: signCreatePost,
      },
      sceneState,
      setSceneState,
      setAccessToken,
      {
        signCreatePost,
        createPostError,
        isLoadingCreatePostMessage,
      },
    );

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
            profileMaker(scene, PROFILE_FRAME_POSITION, 4, profilePost, profile, following);
          }
        }
        const latestPosts = await getPosts(10);
        if (latestPosts) {
          createTrendingCorner(scene, TRENDING_CORNER_POSITION, latestPosts);
        }
      })
    } catch (e) {
      console.log(e);
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
