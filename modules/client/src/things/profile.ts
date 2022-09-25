import {
  AbstractMesh,
  ActionManager,
  Color3,
  ExecuteCodeAction,
  MeshBuilder,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

import { createTextDisplay } from "../utils/babylonUtils";
import { getStandardUrl } from "../utils/misc";
import { getPostsByProfile, getFollowing } from "../utils/lensApi";

import { galleryMaker } from "./gallery";
import { PROFILE_POSITIONS, PROFILE_ROTATIONS } from "src/utils/constants";

const currentlyViewing: AbstractMesh[] = [];
let globalIndex = 0;
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
  if (globalIndex > 4) return;

  const [h, w, d] = [height/2, height, height/18];

  const galleryMesh = galleryMaker(scene, position, height, posts);
  if (!galleryMesh) return;

  galleryMesh.rotation = rotation;

  // const rootMesh = new AbstractMesh(`${profile?.id}-profileRood`, scene);
  // if (galleryMesh)
  //   galleryMesh.parent = rootMesh;

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
      new Vector3(-w + 2*d, h + 3*d, 0),
      new Vector3(-Math.PI / 2, 0, 0)
    )
    profilePicture.parent = galleryMesh;
  }

  // Add profile handle
  const handle = createTextDisplay(
    scene,
    height,
    profile?.id,
    profile?.handle,
    new Vector3(0, 0 + h + 3*d, 0)
  )
  if (handle)
    handle.parent = galleryMesh;

  if (following?.length) {
    // Show Following data
    const followingText = createTextDisplay(
      scene,
      h,
      profile?.id + "following",
      "Following",
      new Vector3(height + 1, h, 0)
    );
    followingText.parent = galleryMesh;

    following.forEach((followingProfile, i) => {
      const profilePicture = createProfilePicture(
        scene,
        followingProfile.profile.id,
        followingProfile.profile?.picture?.original?.url,
        0.3,
        new Vector3(height + 0.3, -2 * d + h - i * 0.4, 0),
        new Vector3(-Math.PI / 2, 0, 0)
      )
      const followingProfileHandle = createTextDisplay(
        scene,
        height / 3,
        followingProfile.profile.id,
        followingProfile.profile.handle,
        new Vector3(height + 1, -2 * d + h - i * 0.4, 0)
      );
      followingProfileHandle.parent = galleryMesh;
      if (profilePicture) {
        profilePicture.parent = galleryMesh;
        profilePicture.actionManager = new ActionManager(scene);
        profilePicture.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
            console.log("current index: ", index);
            if (currentlyViewing?.length === 3) {
              const lastview = currentlyViewing.pop()
              if (lastview) {
                globalIndex -= 1;
                lastview.dispose();
              }
            }
            const followingProfilePosts = await getPostsByProfile(followingProfile.profile.id);
            const newFollowing = await getFollowing(followingProfile.profile.ownedBy);
            // console.log(followingProfilePosts);
            // console.log("Viewing followed profile: ", followingProfile.profile.handle);
            let gallery = profileMaker(
              scene,
              PROFILE_POSITIONS[globalIndex + 1],
              PROFILE_ROTATIONS[globalIndex + 1],
              height,
              followingProfilePosts,
              followingProfile.profile,
              newFollowing,
              globalIndex + 1
            )
            if (gallery) {
              globalIndex += 1;
              // console.log("Setting current gallery");
              currentlyViewing.push(gallery);
            }
          })
        )
      }
    })
  }

  ////////////////////

  // Add profile latest posts
  // console.log("creating gallery")

  // console.log(rotation)
  // rootMesh.rotate(rotation, -Math.PI/2, Space.WORLD);
  // rootMesh.position = position;
  return galleryMesh;
};
