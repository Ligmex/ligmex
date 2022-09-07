import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";

export const addConnectWalletButton = (
  scene: Scene,
  connect: any,
  connectors: any
) => {
  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;
  plane.position.x = 1;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 connect wallet");
  button.width = 1;
  button.height = 0.4;
  button.color = "white";
  button.onPointerUpObservable.add(() => connect({ connector: connectors[0]}));

  advancedTexture.addControl(button);
}
