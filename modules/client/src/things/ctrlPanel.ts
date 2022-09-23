import {
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
import { SceneState } from "../utils/misc";
import { PROFILE_FRAME_VIEW_POSITION } from "../utils/cameraConstants";

export const ctrlPanelMaker = (
  scene: Scene,
  position: Vector3,
  setSceneState: React.Dispatch<React.SetStateAction<SceneState>>
) => {

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
    const content = new TextBlock(`${id}-ctrlPanelContent`);

    content.textWrapping = TextWrapping.WordWrap;
    content.color = "white";
    content.text = "Pretty fkn please input ur username";
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("advinput");

    const input = new InputText("profileIdInput");
    input.isVisible = false
    input.promptMessage = "Enter Profile ID"
    input.height = "100px";
    input.width = "200px";
    input.color = "red";
    input.background = "black"
    input.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    input.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    advancedTexture.addControl(input);

    const searchProfile = Button.CreateSimpleButton("searchProfileButton", "🔎 profile")
    searchProfile.width = "200px";
    searchProfile.height = "100px";
    searchProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    searchProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    if (searchProfile.textBlock) {
      searchProfile.textBlock.color = "white";
    }
    searchProfile.onPointerUpObservable.add(async () => {
      // console.log("hello");
      if (input.isVisible && input.text !== "") {
        const handle = input.text;
        console.log(handle);

        const profileId = await getProfileID(handle);

        console.log(`got handle=${handle}, maybe saving profileId=${profileId}`);

        if (profileId) {
          localStorage.setItem("profileId", profileId);
          setSceneState({
            profileToLoad: profileId,
            camera: {
              position: PROFILE_FRAME_VIEW_POSITION,
              rotation: new Vector3(0, 0, 0),
            }
          })
        }
      }
      input.isVisible = !input.isVisible;
    })

    grid.addControl(content);
    // grid.addControl(input);
    grid.addControl(searchProfile);

    holoslate.content = grid;

    return holoslate;
  }

  const output = [] as any[];
  output.push(createPedestal(`${id}-ctrlPanel`, position));
  output.push(createHoloSlate());

  return output;

}
