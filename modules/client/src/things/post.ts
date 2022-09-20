import {
  AssetContainer,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
  VideoTexture,
} from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";

import { scaleNewMeshes } from "../utils";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

export const createPost = async (scene: Scene, position: Vector3, post: any) => {

  const height = 1;

  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: .25, height },
      scene
    )
    pillar.position = position;
    pillar.checkCollisions = true
  }

  const pillar_position = position;
  const post_position = new Vector3(position.x, position.y + height, position.z);
  const post_rotation = new Vector3(Math.PI/8, 0, 0);

  switch (post?.metadata?.mainContentFocus) {

    case "ARTICLE":
      console.log("Article: ", post.metadata);
      break;

    case "AUDIO":
      // const audio = new Sound(post.id, post.metadata.media[0]?.original?.url, scene, null, {
      //   loop: true,
      //   autoplay: false,
      // });
      console.log("Audio: ", post.metadata);
      break;

    case "EMBED":
      console.log("Embed: ", post.metadata);
      // console.log("Embed: ", post.metadata);
      let animation_url = post.metadata.animatedUrl;
      if (animation_url.split("/").length === 1) return;
      createPedestal(`${post.id}-pillar`, pillar_position);
      if (animation_url.startsWith("ipfs://")) {
        animation_url = animation_url.replace(
          "ipfs://", "https://lens.infura-ipfs.io/ipfs/"
        );
        SceneLoader.LoadAssetContainer(animation_url, "", scene, (glbContainer: AssetContainer) => {
          scaleNewMeshes(glbContainer.meshes, post_position);
          glbContainer.addAllToScene();
        }, null, null, ".glb");
      }
      break;

    case "IMAGE":
      createPedestal(`${post.id}-pillar`, pillar_position);
      const f = new Vector4(0,0, 1, 1);
      const b = new Vector4(0,0, 0.5, 1);
      const plane = MeshBuilder.CreateBox(post.id, {
        depth: 0.03,
        height: post.metadata.media[0]?.original?.height || 1,
        width: post.metadata.media[0]?.original?.width || 1,
        frontUVs: f,
        backUVs: b
      }, scene);
      const material = new StandardMaterial(post.id, scene);
      let url = post.metadata.media[0]?.original?.url.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
      material.diffuseTexture = new Texture(url, scene);
      plane.material = material;
      plane.position = post_position;
      plane.rotation = post_rotation;
      break;

    case "LINK":
      // console.log("Link: ", post.metadata);
      break;

    case "TEXT_ONLY":
      // console.log("Text only: ", post.metadata);
      break;

    case "VIDEO":
      createPedestal(`${post.id}-pillar`, pillar_position);
      const videoPlane = MeshBuilder.CreatePlane(`${post.id}-videoPlane`, {
        width: post.metadata.media[0]?.original?.width || 1,
        height: post.metadata.media[0]?.original?.height || 1
      }, scene);
      const videoMaterial = new StandardMaterial(`${post.id}-videoMaterial`, scene);
      let videoPostUrl = post.metadata.media[0]?.original?.url.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
      videoMaterial.diffuseTexture = new VideoTexture(`${post.id}-videoTexture`, videoPostUrl, scene);
      (videoMaterial.diffuseTexture as VideoTexture).video.muted = true;
      videoPlane.material = videoMaterial;
      videoPlane.position = post_position;
      videoPlane.rotation = post_rotation;
      // console.log("Video: ", post.metadata);
      break;

    default:
      console.log(`Unsuported content focus: ${post.metadata.mainContentFocus}`)
      break;
  };

}

