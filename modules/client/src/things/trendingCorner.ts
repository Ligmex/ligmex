import {
  Scene,
  Vector3,
} from "@babylonjs/core";

import { getPosts } from "../utils";

import { postMaker } from "./post";

export const createTrendingCorner = async (scene: Scene) => {
  const LIMIT = 10;

  // Get Top Posts
  const latestPosts = await getPosts(LIMIT);
  latestPosts.forEach((post: any, i: number) => {
    const t = i/LIMIT * 2 * Math.PI;
    const position = new Vector3(Math.cos( t ) * 3,0.5, Math.sin( t ) * 3);
    postMaker(scene, position, post);
  });

}
