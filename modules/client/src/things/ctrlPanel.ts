import {
  MeshBuilder,
  DynamicTexture,
  StandardMaterial,
  Vector3,
  Vector2,
} from "@babylonjs/core";
import { Grid, GUI3DManager, HolographicSlate, TextBlock, TextWrapping } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core/scene";

export const ctrlPanelMaker = (scene: Scene, position: Vector3) => {

  const id = "ctrlPanel";
  const height = 1;
  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: height / 2, height },
      scene
    )
    pillar.position = new Vector3(position.x, position.y + height/2, position.z);
    pillar.checkCollisions = true
    return pillar;
  }

  const createHoloSlate = async () => {
    const guiManager = new GUI3DManager(scene);
    const holoslate = new HolographicSlate(`${id}-holoState`);
    guiManager.addControl(holoslate);

    const slateW = 2;
    const slateH = 2;

    holoslate.titleBarHeight = 0;
    holoslate.minDimensions = new Vector2(0.2, 0.2);
    holoslate.dimensions = new Vector2(slateW, slateH);
    holoslate.position = new Vector3(
      position.x - slateW / 2,
      position.y + height + slateH,
      position.z
    );
    console.log(holoslate.position);

    // const dynamicTexture = new DynamicTexture(`${id}-ctrlPanelText`, 50, scene, true);
    // dynamicTexture.drawText(
    //   "Please input your Lens username",
    //   5, 10, "8x Arial", "#FFFFFF",
    //   "black",
    // );
    // const newMaterial = new StandardMaterial(`${id}-ctrlPanelMaterial`, scene);
    // newMaterial.diffuseTexture = dynamicTexture;

    const grid = new Grid("newGrid");
    const content = new TextBlock(`${id}-ctrlPanelContent`);
    content.textWrapping = TextWrapping.WordWrap;
    content.color = "white";
    content.text = "Pretty fkn please input ur username";


    grid.addControl(content);
    holoslate.content = grid;

    return holoslate;
  }

  const output = [] as any[];
  output.push(createPedestal(`${id}-ctrlPanel`, position));
  output.push(createHoloSlate());

  return output;

}
