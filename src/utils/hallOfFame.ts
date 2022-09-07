import { explorePublications } from "../apollo";
import {
  Mesh,
  MeshBuilder,
  Scene,
  Sound,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
} from "@babylonjs/core";

const LIMIT = 10;

export const createTrendingCorner = async (scene: Scene) => {

  // Get Top Posts
  
  const latestPosts = await explorePublications({
    sortCriteria: "LATEST",
    publicationTypes: ["POST"],
    limit: LIMIT,
  });
  console.log("Got posts: ", latestPosts);

  // Render Posts by mainContentFocus: VIDEO, IMAGE, ARTICLE, TEXT_ONLY, AUDIO, LINK, EMBED
  // EMBED: If glb/gltf, render 3D object, else 'not supported yet'
  // TEXT_ONLY: Text bubble
  // VIDEO/IMAGE/AUDIO
  
  latestPosts.forEach((post: any, i: number) => {
    const t = i/LIMIT * 2 * Math.PI;
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
        const f = new Vector4(0,0, 1, 1);
        const b = new Vector4(0,0, 0, 0);
        const plane = MeshBuilder.CreatePlane(post.id, {
          height: post.metadata.media[0]?.original?.height || 1,
          width: post.metadata.media[0]?.original?.width || 0.5,
          sideOrientation: Mesh.DOUBLESIDE,
          frontUVs: f,
          backUVs: b
        }, scene);
        const material = new StandardMaterial(post.id, scene);
        material.diffuseTexture = new Texture(post.metadata.media[0]?.original?.url, scene);
        plane.material = material;
        plane.position = new Vector3(Math.cos( t ) * 1,0.5, Math.sin( t ) * 1);
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
  });

}
