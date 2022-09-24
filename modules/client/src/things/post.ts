import {
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
  VideoTexture,
} from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";

import { getStandardUrl } from "../utils/misc";
import { scaleNewMeshes } from "../utils/babylonUtils";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

export const postMaker = async (
  scene: Scene,
  position: Vector3,
  post: any,
): Promise<Array<AbstractMesh>> => {

  const height = 1;

  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: height / 4, height },
      scene
    )
    pillar.position = position;
    pillar.checkCollisions = true
    return pillar;
  }

  const pillar_position = position;
  const post_position = new Vector3(position.x, position.y + height, position.z);
  const post_rotation = new Vector3(Math.PI / 8, 0, 0);

  const output = [] as any[];

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
      const animation_url = getStandardUrl(post.metadata.animatedUrl);
      if (!animation_url) break;
      try {
        const glbContainer = await SceneLoader.LoadAssetContainerAsync(
          animation_url,
          "",
          scene,
          null,
          ".glb"
        );
        if (glbContainer) {
          scaleNewMeshes(glbContainer.meshes, post_position);
          glbContainer.addAllToScene();
        }
        output.push(createPedestal(`${post.id}-pillar`, pillar_position));
        output.push(glbContainer.meshes[0]);
      } catch (e) {
        console.log(e);
      }
      break;

    case "IMAGE":
      let url = getStandardUrl(post.metadata.media[0]?.original?.url);
      if (!url) break;
      output.push(createPedestal(`${post.id}-pillar`, pillar_position));
      const f = new Vector4(0, 0, 1, 1);
      const b = new Vector4(0, 0, 0.5, 1);
      try {
        const imagePlane = MeshBuilder.CreateBox(post.id, {
          depth: 0.03,
          height: post.metadata.media[0]?.original?.height || 1,
          width: post.metadata.media[0]?.original?.width || 1,
          frontUVs: f,
          backUVs: b
        }, scene);
        const material = new StandardMaterial(post.id, scene);
        material.diffuseTexture = new Texture(url, scene);
        imagePlane.material = material;
        imagePlane.position = post_position;
        imagePlane.rotation = post_rotation;
        output.push(imagePlane);
      } catch (e) {
        console.log(e);
      }
      break;

    case "LINK":
      // console.log("Link: ", post.metadata);
      break;

    case "TEXT_ONLY":
      // console.log("Text only: ", post.metadata);
      break;

    case "VIDEO":
      const videoPostUrl = getStandardUrl(post.metadata.media[0]?.original?.url);
      if (!videoPostUrl) break;
      output.push(createPedestal(`${post.id}-pillar`, pillar_position));
      const videoPlane = MeshBuilder.CreatePlane(`${post.id}-videoPlane`, {
        width: post.metadata.media[0]?.original?.width || 1,
        height: post.metadata.media[0]?.original?.height || 1
      }, scene);
      const videoMaterial = new StandardMaterial(`${post.id}-videoMaterial`, scene);
      try {
        videoMaterial.diffuseTexture = new VideoTexture(`${post.id}-videoTexture`, videoPostUrl, scene);
        (videoMaterial.diffuseTexture as VideoTexture).video.muted = true;
        videoPlane.material = videoMaterial;
        videoPlane.position = post_position;
        videoPlane.rotation = post_rotation;
      } catch (e) {
        console.log(e);
      }
      // console.log("Video: ", post.metadata);
      output.push(videoPlane);
      break;

    default:
      console.log(`Unsuported content focus: ${post.metadata.mainContentFocus}`)
      break;
  };

  return output;

}

