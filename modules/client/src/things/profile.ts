import {
  // ActionManager,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

import { galleryMaker } from "./gallery";

export const profileMaker = (scene: Scene, position: Vector3, height: number, posts: any[]) => {
  const galleryMesh = galleryMaker(scene, position, height, posts);
  console.log(galleryMesh);
  // TODO: add profile pic
  return galleryMesh;
};
