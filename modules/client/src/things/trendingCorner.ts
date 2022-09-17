import {
  AssetContainer,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Sound,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector2,
  Vector3,
  Vector4,
  VideoTexture,
} from "@babylonjs/core";
import {
  Control, GUI3DManager, HolographicSlate, TextBlock
} from "@babylonjs/gui"
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import {
  getMyPosts,
  getPosts
} from "../lensApi";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

const LIMIT = 10;

export const createTrendingCorner = async (scene: Scene) => {
  const guiManager = new GUI3DManager(scene);

  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: .25, height: 1 },
      scene
    )
    pillar.position = position;
    pillar.checkCollisions = true
  }

  const createTextPlaque =async (post: any, position: Vector3, f: Vector4, b: Vector4) => {
    console.log(post.metadata.description);
    // const plaque = MeshBuilder.CreateBox(
    //   `${post.id}-plaque`,
    //   {bottomBaseAt: 2, depth: 1/16, height: 1, width: 1, frontUVs: f, backUVs: b },
    //   scene
    // );
    const plaque = MeshBuilder.CreatePlane(
        `${post.id}-plaque`,
        { height: 1, width: 1, frontUVs: new Vector4(0, 0, 1, 1), backUVs: new Vector4(0, 0, 1, 1) },
        scene
      )
    plaque.position = position;
    plaque.addRotation(Math.PI/8, 0, 0);
    plaque.material = new StandardMaterial(`${post.id}-plaqueMaterial`, scene);
    const dynamicTexture = new DynamicTexture(`${post.id}-dynamicTextue`, 50, scene, true);
    console.log(dynamicTexture.scale);
    // dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(
      post.metadata.description,
      5, 10, "8x Arial", "#FFFFFF",
      "black"
      );
    (plaque.material as StandardMaterial).diffuseTexture = dynamicTexture;
  }

  const createHoloSlate =async (post: any) => {
    const postHoloState = new HolographicSlate(`${post.id}-holoState`);
    postHoloState.minDimensions = new Vector2(0.02, 0.02);
    postHoloState.position = new Vector3(0,10,0);
    console.log(postHoloState.minDimensions);
    // postHoloState.linkToTransformNode(anchor)
    postHoloState.dimensions = new Vector2(0.02,0.02);
    guiManager.addControl(postHoloState);
    const description = new TextBlock(`${post.id}-description`); //post.metadata.description;
    const content = new TextBlock(`${post.id}-content`);


  }

  // Get Top Posts
  const latestPosts = await getPosts(LIMIT);
  
  latestPosts.forEach((post: any, i: number) => {
    const t = i/LIMIT * 2 * Math.PI;
    const pillar_position = new Vector3(Math.cos( t ) * 3,0.5, Math.sin( t ) * 3);
    const post_position = new Vector3(Math.cos(t)*3, 1.5, Math.sin(t)*3);
    const post_rotation = new Vector3(Math.PI/8, 0, 0);
    // console.log(post.metadata.mainContentFocus, post.id)
    switch (post?.metadata?.mainContentFocus) {
      case "ARTICLE":
        // console.log("Article: ", post.metadata);
        break;
      case "AUDIO":
        // const audio = new Sound(post.id, post.metadata.media[0]?.original?.url, scene, null, {
        //   loop: true,
        //   autoplay: false,
        // });
        // console.log("Audio: ", post.metadata);
        break;
      case "EMBED":
        // console.log("Embed: ", post.metadata);
        let animation_url = post.metadata.animatedUrl;
        if (animation_url.split("/").length === 1) return;

        createPedestal(`${post.id}-pillar`, pillar_position);
        if (animation_url.startsWith("ipfs://")) {
          animation_url = animation_url.replace(
            "ipfs://", "https://lens.infura-ipfs.io/ipfs/"
          );
          SceneLoader.LoadAssetContainer(animation_url, "", scene, (glbContainer: AssetContainer) => {
            glbContainer.meshes[0].scaling = new Vector3(0.05, 0.05, -0.05);
            glbContainer.meshes[0].position = post_position;
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
  });

}
