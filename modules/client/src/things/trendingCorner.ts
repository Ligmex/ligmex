import {
  AssetContainer,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Sound,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
} from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import {
  getMyPosts,
  getPosts
} from "../lensApi";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

const LIMIT = 10;

export const createTrendingCorner = async (scene: Scene) => {

  const createPedestal = (id: string, position: Vector3) => {
    const pillar = MeshBuilder.CreateCylinder(
      id,
      { diameter: .25, height: 1 },
      scene
    )
    pillar.position = position;
  }

  // Get Top Posts
  
  // const latestPosts = await getMyPosts("0x45dc");
  const latestPosts = await getPosts(LIMIT);
  //console.log("Got posts: ", latestPosts);

  // Render Posts by mainContentFocus: VIDEO, IMAGE, ARTICLE, TEXT_ONLY, AUDIO, LINK, EMBED
  // EMBED: If glb/gltf, render 3D object, else 'not supported yet'
  // TEXT_ONLY: Text bubble
  // VIDEO/IMAGE/AUDIO
  
  latestPosts.forEach((post: any, i: number) => {
    const t = i/LIMIT * 2 * Math.PI;
    const pillar_position = new Vector3(Math.cos( t ) * 2,0.5, Math.sin( t ) * 2);
    const post_position = new Vector3(Math.cos(t)*2, 1.5, Math.sin(t)*2);
    console.log(post.metadata.mainContentFocus, post.id)
    createPedestal(`${post.id}-pillar`, pillar_position);
    switch (post?.metadata?.mainContentFocus) {
      case "ARTICLE":
        // console.log("Article: ", post.metadata);
        break;
      case "AUDIO":
        const audio = new Sound(post.id, post.metadata.media[0]?.original?.url, scene, null, {
          loop: true,
          autoplay: false,
        });
        // console.log("Audio: ", post.metadata);
        break;
      case "EMBED":
        console.log("Embed: ", post.metadata);
        console.log("content uri", post.onChainContentURI);
        let animation_url = post.metadata.animatedUrl;
        if (animation_url.split("/").length === 1) return;
        if (animation_url.startsWith("ipfs://")) {
          animation_url = animation_url.replace(
            "ipfs://", "https://ligmex.infura-ipfs.io/ipfs/"
          );
          // SceneLoader.Append(animation_url, "", scene, null, null, null, "".glb");
          SceneLoader.LoadAssetContainer(animation_url, "", scene, (glbContainer: AssetContainer) => {
            glbContainer.meshes[0].scaling = new Vector3(0.05, 0.05, -0.05);
            glbContainer.meshes[0].position = post_position;
            glbContainer.addAllToScene();
          }, null, null, ".glb");
        }
        break;
      case "IMAGE":
        //const faceUV = new Array<Vector4>;
        //faceUV[0] = new Vector4(0,0, 1, 1);
        const f = new Vector4(0,0, 1, 1);
        const b = new Vector4(0,0, 0.5, 1);
        const plane = MeshBuilder.CreateBox(post.id, {
          depth: 0.03,
          height: post.metadata.media[0]?.original?.height || 1,
          width: post.metadata.media[0]?.original?.width || 1,
          //faceUV
          //sideOrientation: Mesh.DOUBLESIDE,
          frontUVs: f,
          backUVs: b
        }, scene);
        const material = new StandardMaterial(post.id, scene);
        let url = post.metadata.media[0]?.original?.url.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
        material.diffuseTexture = new Texture(url, scene);
        plane.material = material;
        plane.position = post_position;
        plane.rotation = new Vector3(Math.PI/8, 0, 0);
        console.log("Image: ", post.metadata);
        break;
      case "LINK":
        // console.log("Link: ", post.metadata);
        break;
      case "TEXT_ONLY":
        // console.log("Text only: ", post.metadata);
        break;
      case "VIDEO":
        // console.log("Video: ", post.metadata);
        break;
      default:
        // console.log(`Unsuported content focus: ${post.metadata.mainContentFocus}`)
        break;
    };
  });

}
