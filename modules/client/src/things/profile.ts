import {
  // ActionManager,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { createProfilePicture, getStandardUrl } from "../utils";

import { galleryMaker } from "./gallery";

export const profileMaker = (
  scene: Scene,
  position: Vector3,
  height: number,
  posts: any[],
  profile: any,
) => {
  console.log(profile);

  // Add profile Image
  if (profile?.picture?.__typename === "MediaSet") {
    const profileUrl = getStandardUrl(profile?.picture?.original?.url);
    createProfilePicture(
      scene,
      profile?.id,
      profileUrl,
      1,
      new Vector3(position.x - height/3, position.y + 2*height/3, position.z - height/8),
      new Vector3(-Math.PI/2, 0, 0)
    )
  }

  // Add profile latest posts
  const galleryMesh = galleryMaker(scene, position, height, posts);
  console.log(galleryMesh);
  
  return galleryMesh;
};
