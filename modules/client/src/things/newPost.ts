import {
  FilesInput,
  FreeCamera,
  MeshBuilder,
  Tools,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { v4 as uuid } from "uuid";
import { Button, AdvancedDynamicTexture, Container, } from "@babylonjs/gui";
import { ipfs } from "../ipfs";
import { PublicationMainFocus, SceneState } from "../utils";
import { createPost } from "../postToLens";


export const addNewPostButton = (
  scene: Scene,
  connectorOptions: {
    address: string,
    error: any,
    signer: any,
    isLoading: any,
    lenshubPostWithSig: any,
  },
  setSceneState:  React.Dispatch<React.SetStateAction<SceneState>>
) => {

  const plane = MeshBuilder.CreatePlane("plane", {}, scene);
  plane.position.y = 2;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 Create New Post");
  button.width = 0.6;
  button.height = 0.3;
  button.color = "white";
  button.background = "red";

  let input = document.createElement("input")
  input.type = "file";
  input.id = "import";
  input.hidden = true;
  document.body.children[0].appendChild(input);

  input.onchange = (event: any) => {

    const file = event.target.files[0];
    const blob = new Blob([file]);
    const filename = file.name.toLowerCase();


    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      const imageData = await (await fetch(imageDataUrl)).arrayBuffer();

      try {
        const glbIpfsHash = await ipfs.uploadViaInfura(imageData);

        const metaDataIpfsHash = await ipfs.uploadViaInfura(JSON.stringify({
          version: '2.0.0',
          metadata_id: uuid(),
          description: "Test glb upload description",
          content: "Test glb upload content",
          external_url: null,
          animation_url: `ipfs://${glbIpfsHash}`,
          image: null,
          imageMimeType: null,
          name: "Test glb upload name",
          mainContentFocus: PublicationMainFocus.EMBED,
          contentWarning: null,
          attributes: [],
          media: [],
          locale: 'en',
          createdOn: new Date(),
          appId: "ligmex"
        }));
        console.log(glbIpfsHash);
        createPost(metaDataIpfsHash, connectorOptions.signer, connectorOptions.lenshubPostWithSig);

      } catch (e) {
        console.log(e);
      } finally {
        FilesInput.FilesToLoad[filename] = blob as any;
        
        setSceneState({
          newFileToLoad: filename,
          videoStream: false,
          camera: {
            position: new Vector3(0, 1, -3),
            rotation: new Vector3(0, 4, 0)
          }
      });
      }
    };
  }
  Tools.LoadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", () => {
    button.onPointerDownObservable.add(()=>{

      $("#import").trigger('click')
    })
   });
  advancedTexture.addControl(button);
}
