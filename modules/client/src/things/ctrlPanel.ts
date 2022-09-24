import { AddressZero } from "@ethersproject/constants";
import {
  AbstractMesh,
  MeshBuilder,
  Vector3,
  Vector2,
} from "@babylonjs/core";
import { Button, Control, Grid, GUI3DManager, HolographicSlate, InputText } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core/scene";

import { addNewPostButton } from "../things/newPost";
import { SceneState } from "../utils/babylonUtils";
import { createStartVideoStreamButton } from "../utils/livepeer";
import { getProfileID, addLoginButton } from "../utils/lensApi";
import { addConnectWalletButton } from "../utils/wallet";
import { validateToken } from "../utils/misc";
import {
  PROFILE_FRAME_VIEW_POSITION,
  CTRL_BUTTON_WIDTH,
  CTRL_BUTTON_HEIGHT,
} from "../utils/constants";

export const ctrlPanelMaker = async (
  scene: Scene,
  position: Vector3,
  connectorOptions: {
    address?: string,
    connect: any,
    connectors: Array<any>,
    disconnect: any,
    error: any,
    isConnected: boolean,
    isLoading: boolean,
    lenshubPostWithSig: any,
    pendingConnector: any
    signer: any,
  },
  sceneState: any,
  setSceneState: React.Dispatch<React.SetStateAction<SceneState>>,
  setAccessToken: any,
  signOptions: {
    signCreatePost: any,
    createPostError: any,
    isLoadingCreatePostMessage: any,
  }
): Promise<Array<AbstractMesh>> => {

  const { address, connect, connectors, disconnect, error, isConnected, isLoading, lenshubPostWithSig, pendingConnector, signer } = connectorOptions;
  const { signCreatePost, createPostError, isLoadingCreatePostMessage } = signOptions;

  const id = "ctrlPanel";
  const height = 1;
  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: height / 2, height },
      scene
    )
    pillar.position = new Vector3(position.x, position.y + height / 2, position.z);
    pillar.checkCollisions = true
    return pillar;
  }

  const createHoloSlate = async () => {
    const slateW = 2;
    const slateH = 2;

    const guiManager = new GUI3DManager(scene);
    const holoslate = new HolographicSlate(`${id}-holoState`);
    guiManager.addControl(holoslate);

    holoslate.titleBarHeight = 0;
    holoslate.minDimensions = new Vector2(0.2, 0.2);
    holoslate.dimensions = new Vector2(slateW, slateH);
    holoslate.position = new Vector3(
      position.x - slateW / 2,
      position.y + height + slateH,
      position.z
    );

    const grid = new Grid("newGrid");

    ////////////////////////////////////////
    // Text Input

    const inputProfile = new InputText("profileIdInput");
    inputProfile.isVisible = false
    inputProfile.promptMessage = "Enter Profile ID"
    inputProfile.height = CTRL_BUTTON_HEIGHT;
    inputProfile.width = CTRL_BUTTON_WIDTH * 2;
    inputProfile.color = "green";
    inputProfile.background = "black"
    inputProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    inputProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    inputProfile.onFocusObservable.addOnce(() => {
      let camera = scene.getCameraByName("fpsCamera");
      camera?.detachControl()
      document.addEventListener('keyup', (ev) => {
        inputProfile.processKey(ev.keyCode, ev.key, ev)
      })
    })
    grid.addControl(inputProfile);

    const inputToken = new InputText("TokenInput");
    inputToken.isVisible = false
    inputToken.promptMessage = "Enter VIP Token"
    inputToken.height = CTRL_BUTTON_HEIGHT;
    inputToken.width = CTRL_BUTTON_WIDTH * 2;
    inputToken.color = "red";
    inputToken.background = "black"
    inputToken.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    inputToken.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    inputToken.onFocusObservable.addOnce(() => {
      let camera = scene.getCameraByName("fpsCamera");
      camera?.detachControl()
      document.addEventListener('keyup', (ev) => {
        inputToken.processKey(ev.keyCode, ev.key, ev)
      })
    })
    grid.addControl(inputToken);

    ////////////////////////////////////////
    // Setup Buttons

    const connectWalletButton = addConnectWalletButton(scene, {
      isConnected,
      address: address,
      connect,
      connectors,
      error,
      isLoading,
      pendingConnector,
      disconnect
    });
    connectWalletButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    connectWalletButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    grid.addControl(connectWalletButton);

    const loginButton = addLoginButton(scene, setAccessToken, {
      address: address || AddressZero,
      error,
      signer,
      isLoading,
    });
    loginButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    loginButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    grid.addControl(loginButton);

    const token = localStorage.getItem("VipToken");
    if (token && await validateToken(token)) {
      const createPost = Button.CreateSimpleButton("CreatePost", "Create A New Post")
      createPost.width = CTRL_BUTTON_WIDTH;
      createPost.height = CTRL_BUTTON_HEIGHT;
      createPost.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      createPost.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      if (createPost.textBlock) {
        createPost.textBlock.color = "white";
      }
      createPost.onPointerUpObservable.add(async () => {
        // console.log("hello");
        if (inputToken.isVisible && inputToken.text !== "") {
          const token = inputToken.text;
          if (await validateToken(token)) {
            localStorage.setItem("VipToken", token);
            setSceneState({
              camera: {
                position: PROFILE_FRAME_VIEW_POSITION,
                rotation: new Vector3(0, 0, 0),
              }
            })
          }
        }
        inputToken.isVisible = !inputToken.isVisible;
      })
    } else {
      const askToken = Button.CreateSimpleButton("AskToken", "Enter VIP Token\nTo Create A Post")
      askToken.width = CTRL_BUTTON_WIDTH;
      askToken.height = CTRL_BUTTON_HEIGHT;
      askToken.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      askToken.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      if (askToken.textBlock) {
        askToken.textBlock.color = "white";
      }
      askToken.onPointerUpObservable.add(async () => {
        // console.log("hello");
        if (inputToken.isVisible && inputToken.text !== "") {
          const token = inputToken.text;
          if (await validateToken(token)) {
            localStorage.setItem("VipToken", token);
            setSceneState({
              camera: {
                position: PROFILE_FRAME_VIEW_POSITION,
                rotation: new Vector3(0, 0, 0),
              }
            })
          }
        }
        inputToken.isVisible = !inputToken.isVisible;
      })
      grid.addControl(askToken);
    }

    ////////////////////////////////////////
    // Write Buttons

    if (sceneState.profileToLoad) {
      const newPostButton = addNewPostButton(scene, sceneState.profileToLoad, {
        address: address || AddressZero,
        signer: signCreatePost,
        error: createPostError,
        isLoading: isLoadingCreatePostMessage,
        lenshubPostWithSig,
      }, setSceneState);
      newPostButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      newPostButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      grid.addControl(newPostButton);
      const streamButton = createStartVideoStreamButton(scene, setSceneState);
      streamButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      streamButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      grid.addControl(streamButton);
    } else {
      console.warn(`No profile to load, not adding create post button`);
    }

    ////////////////////////////////////////
    // Read Buttons

    const askProfile = Button.CreateSimpleButton("searchProfileButton", "🔎 profile")
    askProfile.width = CTRL_BUTTON_WIDTH;
    askProfile.height = CTRL_BUTTON_HEIGHT;
    askProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    askProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    if (askProfile.textBlock) {
      askProfile.textBlock.color = "white";
    }
    askProfile.onPointerUpObservable.add(async () => {
      // console.log("hello");
      if (inputProfile.isVisible && inputProfile.text !== "") {
        const handle = inputProfile.text;
        console.log(handle);
        const profileId = await getProfileID(handle);
        console.log(`got handle=${handle}, maybe saving profileId=${profileId}`);
        inputProfile.isVisible = false;
        inputProfile.text = "";
        if (profileId) {
          localStorage.setItem("ProfileID", profileId);
          setSceneState({
            profileToLoad: profileId,
            camera: {
              position: PROFILE_FRAME_VIEW_POSITION,
              rotation: new Vector3(0, 0, 0),
            }
          })
        }
      }
      inputProfile.isVisible = !inputProfile.isVisible;
      if (inputProfile.isVisible) inputToken.isVisible = false;
    })
    grid.addControl(askProfile);


    holoslate.content = grid;

    return [holoslate];
  }

  const output = [] as any[];
  output.push(createPedestal(`${id}-ctrlPanel`, position));
  output.push(createHoloSlate());

  return output;

}
