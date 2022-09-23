import {
  // ActionManager,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { createProfilePicture } from "../utils";

import { galleryMaker } from "./gallery";

export const profileMaker = (
  scene: Scene,
  position: Vector3,
  height: number,
  posts: any[],
  profile: any,
) => {
  console.log(profile);

  if (profile?.picture?.__typename === "MediaSet") {
    const profilePicture = MeshBuilder.CreateCylinder(
      `${profile?.id}-profileDisc`,
        { diameter: 1, height: 0.2 },
        scene
    );
    const material = new StandardMaterial(`${profile?.id}-profilePicture`, scene);
    profilePicture.material = material;
    profilePicture.position = new Vector3(position.x, position.y + height, position.z);
    profilePicture.rotation = new Vector3(Math.PI/2, 0, 0)
  }

  const galleryMesh = galleryMaker(scene, position, height, posts);
  console.log(galleryMesh);
  // TODO: add profile pic
  return galleryMesh;
};
