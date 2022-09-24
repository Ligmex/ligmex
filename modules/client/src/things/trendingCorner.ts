import {
  ActionManager,
  ExecuteCodeAction,
  Scene,
  Vector2,
  Vector3,
} from "@babylonjs/core";

import { getStandardUrl } from "../utils/misc";
import { createTextDisplay } from "../utils/babylonUtils";

import { Control, Grid, GUI3DManager, HolographicSlate, TextBlock, TextWrapping, Image as GuiImage } from "@babylonjs/gui";
import { postMaker } from "./post";

export const createTrendingCorner = async (scene: Scene, position: Vector3, latestPosts: any[]) => {
  const LIMIT = 10;

  const guiManager = new GUI3DManager(scene);
  const holoslate = new HolographicSlate(`postMetadataDisplaySlate`);
  guiManager.addControl(holoslate);

  holoslate.titleBarHeight = 0;
  holoslate.minDimensions = new Vector2(0.2, 0.2);
  holoslate.dimensions = new Vector2(1, 1);

  const grid = new Grid("postMetadataDisplayGrid");

  const postProfile = new GuiImage("postProfileImage");
  postProfile.width = "100px";
  postProfile.height = "100px";
  postProfile.setPadding("5%", "0%", "0%", "5%");
  postProfile.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  postProfile.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  

  // Text Blocks
  const postContent = new TextBlock(`postContentTextBlock`);
  const postAuthor = new TextBlock(`postAuthorTextBlock`);
  const postDescription = new TextBlock(`postDescriptionTextBlock`);

  postAuthor.height = 0.2;
  postAuthor.color = "white";
  postAuthor.textWrapping = TextWrapping.WordWrap;
  postAuthor.setPadding("5%", "5%", "5%", "5%");
  postAuthor.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  postAuthor.fontWeight = "bold";
  postAuthor.fontSize = "25px";

  postContent.height = 0.4;
  postContent.color = "white";
  postContent.textWrapping = TextWrapping.WordWrap;
  postContent.setPadding("5%", "5%", "5%", "5%");
  postContent.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  postContent.fontSize = "20px";

  postDescription.color = "white";
  postDescription.textWrapping = TextWrapping.WordWrap;
  postDescription.setPadding("5%", "5%", "5%", "5%");
  postDescription.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  postDescription.fontSize = "20px";

  /////////////

  // Add to grid
  grid.addControl(postProfile);
  grid.addControl(postAuthor);
  grid.addControl(postContent);
  grid.addControl(postDescription);
  holoslate.content = grid;
  holoslate.isVisible = false;

  createTextDisplay(
    scene,
    3,
    "trendingCorner",
    "TRENDING POSTS",
    new Vector3(position.x, position.y + 3, position.z)
  );

  // Get Top Posts
  latestPosts.forEach(async (post: any, i: number) => {
    const t = i / LIMIT * 2 * Math.PI;
    const postMesh = await postMaker(
      scene,
      new Vector3(
        position.x + Math.cos(t) * 3,
        position.y + 0.5,
        position.z + Math.sin(t) * 3,
      ),
      post,
    );
    if (postMesh?.length > 0) {
      postMesh[0].actionManager = new ActionManager(scene);
      postMesh[0].actionManager.registerAction(
        new ExecuteCodeAction(
          ActionManager.OnPickTrigger,
          async () => {
            if (holoslate.isVisible) {
              holoslate.isVisible = false;
              return;
            }
            if (post?.profile?.picture?.original?.url) {
              console.log("Setting profile image too", post?.profile?.picture?.original?.url);
              try {
                postProfile.source = getStandardUrl(post?.profile?.picture?.original?.url);
              } catch (e) {
                console.log(e);
              }
            }
            holoslate.isVisible = true;
            postAuthor.text = post?.profile?.handle;
            postContent.text = "Content: " + post?.metadata?.content;
            postDescription.text = "Description: " + post?.metadata?.description;
            holoslate.position = new Vector3(
              position.x + Math.cos(t) * 3 - 0.5,
              position.y + 2,
              position.z + Math.sin(t) * 3 - 0.5
            )
          }
        )
      )
    }
  });

}