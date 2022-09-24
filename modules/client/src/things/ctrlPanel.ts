import {
  AbstractMesh,
  MeshBuilder,
  DynamicTexture,
  StandardMaterial,
  Vector3,
  Vector2,
  DeviceSourceManager,
  DeviceType,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, Grid, GUI3DManager, HolographicSlate, InputText, TextBlock, TextWrapping } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core/scene";

import { getProfileID } from "../utils/lensApi";
import { validateToken, SceneState } from "../utils/misc";
import { PROFILE_FRAME_VIEW_POSITION } from "../utils/cameraConstants";

import {
  addLoginButton,
  addConnectWalletButton,
  createStartVideoStreamButton,
  createVideoStreamDisplay,
  getPosts,
  getProfileByOwner,
} from "../utils";

export const ctrlPanelMaker = async (
  scene: Scene,
  position: Vector3,
  connectorOptions: {
    address?: string,
    error: any,
    signer: any,
    isLoading: any,
    lenshubPostWithSig: any,
  },
  setSceneState: React.Dispatch<React.SetStateAction<SceneState>>
): Promise<Array<AbstractMesh>> => {

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

    /*
    const content = new TextBlock(`${id}-ctrlPanelContent`);
    content.textWrapping = TextWrapping.WordWrap;
    content.color = "white";
    content.text = "Pretty fkn please input ur username";
    */

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("advinput");

    const inputProfile = new InputText("profileIdInput");
    inputProfile.isVisible = false
    inputProfile.promptMessage = "Enter Profile ID"
    inputProfile.height = "100px";
    inputProfile.width = "200px";
    inputProfile.color = "red";
    inputProfile.background = "black"
    inputProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    inputProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    inputProfile.onFocusObservable.addOnce(() => {
      let camera = scene.getCameraByName("fpsCamera");
      camera?.detachControl()
      document.addEventListener('keyup', (ev) => {
        inputProfile.processKey(ev.keyCode, ev.key, ev)
      })
    })

    // advancedTexture.addControl(inputProfile);

    const askProfile = Button.CreateSimpleButton("searchProfileButton", "🔎 profile")
    askProfile.width = "200px";
    askProfile.height = "100px";
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
    })

    const inputToken = new InputText("TokenInput");
    inputToken.isVisible = false
    inputToken.promptMessage = "Enter Token ID"
    inputToken.height = "100px";
    inputToken.width = "200px";
    inputToken.color = "red";
    inputToken.background = "black"
    inputToken.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    inputToken.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    advancedTexture.addControl(inputToken);

    const token = localStorage.getItem("VipToken");
    if (token && await validateToken(token)) {

      const createPost = Button.CreateSimpleButton("CreatePost", "Create A New Post")
      createPost.width = "200px";
      createPost.height = "100px";
      createPost.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
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

      const askToken = Button.CreateSimpleButton("AskToken", "Enter VIP Token")
      askToken.width = "200px";
      askToken.height = "100px";
      askToken.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      askToken.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
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

    grid.addControl(askProfile);
    grid.addControl(inputProfile);
    grid.addControl(inputToken);

    // advancedTexture.addControl(grid);
    holoslate.content = grid;

    return [holoslate];
  }

  const output = [] as any[];
  output.push(createPedestal(`${id}-ctrlPanel`, position));
  output.push(createHoloSlate());

  return output;

}
