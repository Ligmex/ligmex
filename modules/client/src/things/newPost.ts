import {
  FilesInput,
  Tools,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { v4 as uuid } from "uuid";
import { Button, AdvancedDynamicTexture, Container, } from "@babylonjs/gui";
import { login } from "../postToLens";
import { ipfs } from "../ipfs";
import { PublicationMainFocus } from "../utils";
import { createPost } from "../postToLens";


export const addLoginButton = (
  scene: Scene,
  setAccessToken: any,
  connectorOptions: {
    address: string,
    error: any,
    signer: any,
    isLoading: any
  }
) => {
  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;
  plane.position.x = 0.5;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 Login");
  button.width = 0.2;
  button.height = 0.1;
  button.color = "white";
  button.background = "red";
  button.onPointerUpObservable.add(() => login(connectorOptions.address, connectorOptions.signer, setAccessToken));

  advancedTexture.addControl(button);
}

export const addNewPostButton = (
  scene: Scene,
  connectorOptions: {
    address: string,
    error: any,
    signer: any,
    isLoading: any,
    lenshubPostWithSig: any,
  },
  setNewFile: any
) => {

  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 Create New Post");
  button.width = 0.2;
  button.height = 0.1;
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
        setNewFile(filename)
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
