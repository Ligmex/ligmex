import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";
import { createPost } from "../postToLens";

export const addNewPostButton = (
  scene: Scene,
) => {
  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 new post");
  button.width = 1;
  button.height = 0.4;
  button.color = "white";
  button.onPointerUpObservable.add(() => createPost());

  advancedTexture.addControl(button);
}
