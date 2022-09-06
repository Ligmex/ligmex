import { explorePublications } from "../apollo";
import {
  Scene,
  Sound,
} from "@babylonjs/core";

export const createTrendingCorner = async (scene: Scene) => {

  // Get Top Posts
  
  const latestPosts = await explorePublications({
    sortCriteria: "LATEST",
    publicationTypes: ["POST"],
    limit: 10
  });
  console.log("Got posts: ", latestPosts);

  // Render Posts by mainContentFocus: VIDEO, IMAGE, ARTICLE, TEXT_ONLY, AUDIO, LINK, EMBED
  // EMBED: If glb/gltf, render 3D object, else 'not supported yet'
  // TEXT_ONLY: Text bubble
  // VIDEO/IMAGE/AUDIO
  latestPosts.forEach((post: any) => {
    console.log(typeof(post.metadata.mainContentFocus), post.id)
    switch (post?.metadata?.mainContentFocus) {
      case "ARTICLE":
        console.log("Article: ", post.metadata);
        break;
      case "AUDIO":
        const audio = new Sound(post.id, post.metadata.media[0]?.original?.url, scene, null, {
          loop: true,
          autoplay: false,
        });
        console.log("Audio: ", post.metadata);
        break;
      case "EMBED":
        console.log("Embed: ", post.metadata);
        break;
      case "IMAGE":
        console.log("Image: ", post.metadata);
        break;
      case "LINK":
        console.log("Link: ", post.metadata);
        break;
      case "TEXT_ONLY":
        console.log("Text only: ", post.metadata);
        break;
      case "VIDEO":
        console.log("Video: ", post.metadata);
        break;
      default:
        console.log(`Unsuported content focus: ${post.metadata.mainContentFocus}`)
        break;
    };
    console.log(post.__typename);
  });

}
