import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { createTextDisplay, createProfilePicture, getStandardUrl, getPostsByProfile } from "../utils";

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
  
  if (following) {
    // Show Following data
    createTextDisplay(
      scene,
      height,
      profile?.id + "following",
      "Following",
      new Vector3(position.x + height + 1, position.y + height, position.z)
    );
    let currentlyViewing: AbstractMesh;
    following.forEach((followingProfile, i) => {
      const profilePicture = createProfilePicture(
        scene,
        followingProfile.profile.id,
        followingProfile.profile?.picture?.original?.url,
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
      if (profilePicture) {
        profilePicture.actionManager = new ActionManager(scene);
        profilePicture.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
            if (currentlyViewing) {
              console.log(currentlyViewing);
              console.log("disposing current gallery");
              currentlyViewing.dispose();
            }
            const followingProfilePosts = await getPostsByProfile(followingProfile.profile.id);
            console.log(followingProfilePosts);
            console.log("Viewing followed profile: ", followingProfile.profile.handle);
            let gallery = profileMaker(
              scene,
              new Vector3(-3, 0, 4),
              4,
              followingProfilePosts,
              followingProfile.profile,
              null
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

  return galleryMesh;
};
