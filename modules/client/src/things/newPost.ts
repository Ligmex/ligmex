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
import { ipfs } from "../ipfs";

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
  const assetsManager = new AssetsManager(scene);

  const button = Button.CreateSimpleButton("newPost", "📡 Create New Post");
  button.width = 0.2;
  button.height = 0.1;
  button.color = "white";
  button.background = "red";

  let input = document.createElement("input")
  input.type = "file";
  input.id = "import";
  input.hidden = true;
  // input.accept = "0px"//".json,.png";
  document.body.children[0].appendChild(input);

  input.onchange = (event: any) => {
    console.log("loading file");

    const file = event.target.files[0];
    const blob = new Blob([file]);
    const filename = file.name.toLowerCase();


    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      const imageData = await (await fetch(imageDataUrl)).arrayBuffer();
      try {
        const id = await ipfs.upload(imageData);
        console.log(id);
      } catch (e) {
        console.log(e);
      } finally {
        FilesInput.FilesToLoad[filename] = blob as any;
        assetsManager.addMeshTask(`loader-${filename}`, "", "file:", filename);
        /*
        SceneLoader.LoadAssetContainer(imageDataUrl, "",  scene,
          (container) => {
            console.log(container);
            console.log(scene);
            //container.addAllToScene();

          }, (progress) => console.log , (error) => console.log("error: ", error));
        */
      }
    };
    assetsManager.load();
  }
  Tools.LoadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", () => {
    button.onPointerDownObservable.add(()=>{
      $("#import").trigger('click')
    })
   });
  advancedTexture.addControl(button);
}
