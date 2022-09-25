import {
  AbstractMesh,
  ActionManager,
  Color3,
  ExecuteCodeAction,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

import { createTextDisplay } from "../utils/babylonUtils";
import { getStandardUrl } from "../utils/misc";
import { getPostsByProfile, getFollowing } from "../utils/lensApi";

import { galleryMaker } from "./gallery";

export const profileMaker = (
  scene: Scene,
  position: Vector3,
  rotation: Vector3,
  height: number,
  posts: any[],
  profile: any,
  following: any,
  index: number,
) => {

  const rootMesh = new AbstractMesh(`${profile?.id}-profileRood`, scene);

  const createProfilePicture = (
    scene: Scene,
    id: string,
    url: string,
    size: number,
    position: Vector3,
    rotation: Vector3
  ) => {
    const profilePicture = MeshBuilder.CreateCylinder(
      `${id}-profileDisc`,
      { diameter: size, height: 0.05 },
      scene
    )
    const material = new StandardMaterial(`${id}-profilePicture`, scene);
    material.diffuseTexture = new Texture(url, scene);
    material.emissiveColor = Color3.White();
    profilePicture.material = material;
    profilePicture.position = position;
    profilePicture.rotation = rotation;
    return profilePicture;
  };

  // Add profile Image
  if (profile?.picture?.__typename === "MediaSet") {
    const profileUrl = getStandardUrl(profile?.picture?.original?.url);
    const profilePicture = createProfilePicture(
      scene,
      profile?.id,
      profileUrl,
      1,
      new Vector3(position.x - height + 0.5, position.y + height + 0.5, position.z - height / 8),
      new Vector3(-Math.PI / 2, 0, 0)
    )
    profilePicture.parent = rootMesh;
  }

  // Add profile handle
  const handle = createTextDisplay(
    scene,
    height,
    profile?.id,
    profile?.handle,
    new Vector3(position.x, position.y + height + 0.5, position.z)
  )
  if (handle)
    handle.parent = rootMesh;

  if (following?.length) {
    // Show Following data
    const followingText = createTextDisplay(
      scene,
      height,
      profile?.id + "following",
      "Following",
      new Vector3(position.x + height + 1, position.y + height, position.z)
    );
    followingText.parent = rootMesh;

    let currentlyViewing: AbstractMesh;

    following.forEach((followingProfile, i) => {
      const profilePicture = createProfilePicture(
        scene,
        followingProfile.profile.id,
        followingProfile.profile?.picture?.original?.url,
        0.3,
        new Vector3(position.x + height + 0.3, position.y + 7 * height / 8 - i * 0.4, position.z),
        new Vector3(-Math.PI / 2, 0, 0)
      )
      const followingProfileHandle = createTextDisplay(
        scene,
        height / 3,
        followingProfile.profile.id,
        followingProfile.profile.handle,
        new Vector3(position.x + height + 1, position.y + 7 * height / 8 - i * 0.4, position.z)
      );
      followingProfileHandle.parent = rootMesh;
      if (profilePicture) {
        profilePicture.parent = rootMesh;
        profilePicture.actionManager = new ActionManager(scene);
        profilePicture.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
            if (currentlyViewing) {
              console.log(currentlyViewing);
              console.log("disposing current gallery");
              currentlyViewing.dispose();
            }
            const followingProfilePosts = await getPostsByProfile(followingProfile.profile.id);
            const newFollowing = await getFollowing(followingProfile.profile.ownedBy);
            console.log(followingProfilePosts);
            console.log("Viewing followed profile: ", followingProfile.profile.handle);
            let gallery = profileMaker(
              scene,
              new Vector3(-3, 0, 4),
              new Vector3(0, Math.PI / 4, 0),
              4,
              followingProfilePosts,
              followingProfile.profile,
              newFollowing,
              index + 1
            )
            if (gallery) {
              console.log("Setting current gallery");
              currentlyViewing = gallery;
            }
          })
        )
      }
    })
  }

  ////////////////////

  // Add profile latest posts
  console.log("creating gallery")
  const galleryMesh = galleryMaker(scene, position, height, posts);

  if (galleryMesh)
    galleryMesh.parent = rootMesh;

  console.log(rootMesh.rotation, rotation)
  rootMesh.rotation = rotation;
  return rootMesh;
};
