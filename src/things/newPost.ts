import {
  AssetsManager,
  SceneLoader,
  FilesInput,
  Tools,
} from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";
import { login } from "../postToLens";
import { uploadToIpfs } from "../ipfs";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

export const addLoginButton = (
  scene: Scene,
  connectorOptions: {
    address: string,
    signerError: any,
    signMessage: any,
    isLoadingSignMessage: any
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
  button.onPointerUpObservable.add(() => login(connectorOptions.address, connectorOptions.signMessage));

  advancedTexture.addControl(button);
}

export const addNewPostButton = (
  scene: Scene,
  connectorOptions: {
    address: string,
    signerError: any,
    signMessage: any,
    isLoadingSignMessage: any
  }
) => {

  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "📡 Create New Post");
  button.width = 0.2;
  button.height = 0.1;
  button.color = "white";
  button.background = "red";

  Tools.LoadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", () => {
    let input = document.createElement("input")
    input.type = "file";
    input.id = "import";
    input.hidden = true;
    // input.accept = "0px"//".json,.png";
    input.onchange = (event: any) => {
      console.log("loading file");
      // console.log(filename);
      const file = event.target.files[0];
      const filename = event.target.value;

       const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const imageDataUrl = reader.result as string;
          const imageData = await (await fetch(imageDataUrl)).arrayBuffer();
          try {
            const id = await uploadToIpfs(imageData);
            console.log(id);
          } catch (e) {
            console.log(e);
          } finally {
            /*
            const assetsManager = new AssetsManager(scene);
            FilesInput.FilesToLoad[filename] = imageData;
            assetsManager.addMeshTask(`loader-${filename}`, "", imageDataUrl, "");
            //assetsManager.addMeshTask(`loader-${filename}`, "", imageDataUrl, "");
            assetsManager.load();
            SceneLoader.LoadAssetContainer(imageDataUrl, "",  scene,
              (container) => {
                console.log(container);
                console.log(scene);
                container.addAllToScene();

              }, (progress) => console.log , (error) => console.log("error: ", error));
            */
          }
        };
        /*
        const blob = new Blob([file]);
         */
    }
    document.body.appendChild(input)
    button.onPointerDownObservable.add(()=>{
      $("#import").trigger('click')
    })
   });
  advancedTexture.addControl(button);
}
