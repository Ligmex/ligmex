import { SceneLoader, FilesInput, Tools } from "@babylonjs/core";
//import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import { GLTFFileLoader } from "babylonjs-loaders";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";
import { login } from "../postToLens";

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
  /*
  button.onPointerUpObservable.add(() => {
    console.log("Create New Post")
    let input = document.createElement("input");
    input.setAttribute("id", "loadFile");
    input.setAttribute("type", "file");
    input.style.position = "absolute";
    input.style.top = "80px";
    input.style.width = "200px"
    input.style.height = "100px";
    input.style.right = "40px"
    document.body.children[0].appendChild(input);
  });
*/

  //const assetsManager = new AssetsManager(scene);

   Tools.LoadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", () => {
    let input = document.createElement("input")
    input.type = "file";
    input.id = "import";
    input.hidden = true;
    input.onchange = (event: any) => {
      console.log("loading file");
      const fileList = event.target.files;
      const filename = fileList[0].name;
      console.log(filename)
      console.log(fileList);
      const blob = new Blob([fileList[0]]);

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as any;
      
      console.log(FilesInput.FilesToLoad);

      SceneLoader.LoadAssetContainer("file:", filename,  scene,
        (container) => {
          console.log(scene);

          container.addAllToScene();
          console.log(container.meshes);
        }, (progress) => console.log , (error) => console.log("error: ", error), "glb");
      //assetsManager.addMeshTask(`uploadFile-${filename}`, "", "file:", filename);
      //assetsManager.load();
    }

    input.style.position = "fixed";
    input.style.top = "calc(100% - 10%)";
    //input.accept = "0px"//".json,.png";
  //  input.style.display = "block"
    document.body.appendChild(input)

    button.onPointerDownObservable.add(()=>{
      $("#import").trigger('click')
    })
   });





  advancedTexture.addControl(button);
}
