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
    console.log(post.metadata.mainContentFocus, post.id)
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
        const metadata_url = post.onChainContentURI.replace(
          "ipfs://",
          "https://ligmex.infura-ipfs.io/ipfs/"
        )
        $.getJSON(metadata_url, (data) => {
          let animation_url = data.animation_url as string;
          if (animation_url.split("/").length === 1) return;
          if (animation_url.startsWith("ipfs://")) {
            animation_url = animation_url.replace(
              "ipfs://", "https://ligmex.infura-ipfs.io/ipfs/"
            );
          // SceneLoader.Append(animation_url, "", scene, null, null, null, "".glb");
          SceneLoader.LoadAssetContainer(animation_url, "", scene, (glbContainer: AssetContainer) => {
            // glbContainer.transformNodes.forEach((rootNode) => rootNode.scaling.scaleInPlace(0.2))
            // const entries = glbContainer.instantiateModelsToScene();
            // console.log(entries);
            // entries.rootNodes.forEach((rootNode) => rootNode.scaling.scaleInPlace(0.2))
            // console.log(glbContainer);

            console.log(glbContainer.meshes);
            glbContainer.meshes[0].scaling = new Vector3(0.02, 0.02, 0.02);
            // glbContainer.meshes.forEach((mesh) => mesh.scaling.scaleInPlace(0.2))
            glbContainer.addAllToScene();
          }, null, null, ".glb");
        }

          console.log(data.animation_url)
        })

        break;
      case "IMAGE":
        //const faceUV = new Array<Vector4>;
        //faceUV[0] = new Vector4(0,0, 1, 1);
        const f = new Vector4(0,0, 1, 1);
        const b = new Vector4(0,0, 0.5, 1);
        const plane = MeshBuilder.CreateBox(post.id, {
          depth: 0.03,
          height: post.metadata.media[0]?.original?.height || 1,
          width: post.metadata.media[0]?.original?.width || 0.5,
          //faceUV
          //sideOrientation: Mesh.DOUBLESIDE,
          frontUVs: f,
          backUVs: b
        }, scene);
        const material = new StandardMaterial(post.id, scene);
        let url = post.metadata.media[0]?.original?.url.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
        material.diffuseTexture = new Texture(url, scene);
        plane.material = material;
        plane.position = new Vector3(Math.cos( t ) * 1,0.5, Math.sin( t ) * 1);
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
