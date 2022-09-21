import {
  Scene,
  Vector3,
} from "@babylonjs/core";

import { getPosts } from "../utils";

import { postMaker } from "./post";

export const createTrendingCorner = async (scene: Scene, position: Vector3, latestPosts: any[]) => {
  const LIMIT = 10;

  // Get Top Posts
  latestPosts.forEach((post: any, i: number) => {
    const t = i/LIMIT * 2 * Math.PI;
    postMaker(
      scene,
      new Vector3(
        position.x + Math.cos(t) * 3,
        position.y + 0.5,
        position.z + Math.sin(t) * 3,
      ),
      post,
    );
  });

}
