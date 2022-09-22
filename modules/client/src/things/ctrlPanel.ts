import {
  MeshBuilder,
  DynamicTexture,
  StandardMaterial,
  Vector3,
  Vector2,
} from "@babylonjs/core";
import { Grid, GUI3DManager, HolographicSlate,  TextBlock } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core/scene";

export const ctrlPanelMaker = (scene: Scene, position: Vector3) => {

  const id = "ctrlPanel";
  const height = 1;

  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: height/2, height },
      scene
    )
    pillar.position = position;
    pillar.checkCollisions = true
    return pillar;
  }

  const createHoloSlate = async () => {
    const holoslate = new HolographicSlate(`${id}-holoState`);
    holoslate.minDimensions = new Vector2(0.2, 0.2);
    holoslate.position = new Vector3(0, 0, 0); // position.x, position.y + height, position.z);
    holoslate.dimensions = new Vector2(2, 2);

    const guiManager = new GUI3DManager(scene);
    guiManager.addControl(holoslate);

    const dynamicTexture = new DynamicTexture(`${id}-ctrlPanelText`, 50, scene, true);
    dynamicTexture.drawText(
      "Please input your Lens username",
      5, 10, "8x Arial", "#FFFFFF",
      "black",
    );
    const newMaterial = new StandardMaterial(`${id}-ctrlPanelMaterial`, scene);
    newMaterial.diffuseTexture = dynamicTexture;

    const grid = new Grid("newGrid");

    const content = new TextBlock(`${id}-ctrlPanelContent`);
    content.text = "Pretty fkn please input ur username";
    content.color = "white";

    grid.addControl(content);
    holoslate.content = grid;

    return holoslate;
  }

  const output = [] as any[];
  output.push(createPedestal(`${id}-ctrlPanel`, position));
  output.push(createHoloSlate());

  return output;

}
