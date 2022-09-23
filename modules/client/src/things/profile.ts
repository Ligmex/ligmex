import {
  Color3,
  DynamicTexture,
  // ActionManager,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { GUI3DManager, HolographicBackplate } from "@babylonjs/gui";
import { createTextDisplay, createProfilePicture, getStandardUrl } from "../utils";

import { galleryMaker } from "./gallery";

export const profileMaker = (
  scene: Scene,
  position: Vector3,
  height: number,
  posts: any[],
  profile: any,
  following: any,
) => {

  // Add profile Image
  if (profile?.picture?.__typename === "MediaSet") {
    const profileUrl = getStandardUrl(profile?.picture?.original?.url);
    createProfilePicture(
      scene,
      profile?.id,
      profileUrl,
      1,
      new Vector3(position.x - height + 0.5, position.y + height + 0.5, position.z - height / 8),
      new Vector3(-Math.PI / 2, 0, 0)
    )
  }

  // Add profile handle
  createTextDisplay(
    scene,
    height,
    profile?.id,
    profile?.handle,
    new Vector3(position.x, position.y + height + 0.5, position.z)
  )


  // Show Following data
  createTextDisplay(
    scene,
    height,
    profile?.id + "following",
    "Following",
    new Vector3(position.x + height + 1, position.y + height, position.z)
  );

  console.log(following);
  following.forEach((followingProfile, i) => {
    createProfilePicture(
      scene,
      followingProfile.profile.id,
      followingProfile.profile.picture.original.url,
      0.3,
      new Vector3(position.x + height + 0.3, position.y + 7*height/8 - i* 0.4, position.z),
      new Vector3(-Math.PI / 2, 0, 0)
    )
    createTextDisplay(
      scene,
      height/3,
      followingProfile.profile.id,
      followingProfile.profile.handle,
      new Vector3(position.x + height + 1, position.y + 7*height/8 - i* 0.4, position.z)
    );
  })
  // const guiManager = new GUI3DManager(scene);
  // const holoslate = new HolographicBackplate


  ////////////////////

  // Add profile latest posts
  const galleryMesh = galleryMaker(scene, position, height, posts);

  return galleryMesh;
};
