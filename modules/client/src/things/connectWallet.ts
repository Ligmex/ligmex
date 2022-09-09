import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button, AdvancedDynamicTexture, } from "@babylonjs/gui";

export const addConnectWalletButton = (
  scene: Scene,
  connectorOptions: {
    isConnected: boolean,
    address?: string,
    connect: any,
    connectors: Array<any>,
    error: any,
    isLoading: boolean,
    pendingConnector: any
  }
) => {
  const plane = Mesh.CreatePlane("plane", 2, scene);
  plane.position.y = 2;
  plane.position.x = 1;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  let button: Button;
  if (connectorOptions.isConnected) {
    button = Button.CreateSimpleButton("disconnet", "❌ disconnet wallet");
    button.background = "green";
    console.log(connectorOptions.address);
    // TODO add disconnect 
  } else {
    button = Button.CreateSimpleButton("newPost", "📡 connect wallet");
    button.background = "black";
    button.onPointerUpObservable.add(() => connectorOptions.connect({ connector: connectorOptions.connectors[0]}));
  }
  button.width = 0.2;
  button.height = 0.1;
  button.color = "white";

  advancedTexture.addControl(button);
}
