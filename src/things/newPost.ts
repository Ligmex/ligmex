import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";
import { createPost } from "../postToLens";

export const addNewPostButton = (
  scene: Scene,
  connectorOptions: {
    address: string,
    signerError: any,
    signMessage: any,
    isLoadingSignMessage: any
  }
) => {
  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 new post");
  button.width = 1;
  button.height = 0.4;
  button.color = "white";
  button.background = "red";
  button.onPointerUpObservable.add(() => createPost(connectorOptions.address, connectorOptions.signMessage));

  advancedTexture.addControl(button);
}
