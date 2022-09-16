import {
    Color3,
    MeshBuilder,
    Scene,
    SceneLoader,
    StandardMaterial,
    Vector3,
    VideoTexture
} from "@babylonjs/core";

// Babylon GUI imports
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";

// Web3 imports
import { verifyMessage } from "ethers/lib/utils";

// Livepeer imports
import { Client } from "@livepeer/webrtmp-sdk";

import { AuthenticateResponse } from './utils';
import {
    authenticate,
    generateChallenge
} from "./lensApi"

const setupLivepeerStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    })
    const client = new Client();
    const session = client.cast(stream, "939a-mn33-if66-zqfg" );
}

const login = async (address: string, signMessage: any, setAccessToken: any) => {
    // request a challenge from the server
    const challengeResponse = await generateChallenge(address);
  
    // sign the text with the wallet
    const sig = await signMessage({ message: challengeResponse.data.challenge.text});
    console.log(sig);
    const recoveredAddress = verifyMessage(challengeResponse.data.challenge.text, sig)
        if (address === recoveredAddress && sig) {
          const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
          console.log("Setting access token");
          setAccessToken(jwtTokens);
          //console.log(jwtTokens);
          localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
          localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
        }
  };

export const createUploadFileView = (scene: Scene, filname: string | undefined) => {
    if (!scene || !filname) return;
    SceneLoader.LoadAssetContainer("file:", filname, scene, (container) => {
        console.log("loading scene container");
        container.meshes[0].scaling = new Vector3(0.05, 0.05, -0.05);
        container.addAllToScene();
    });
}

export const createStartVideoStreamButton = (
    scene: Scene,
    setStartVideoStream: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const videoStreamButton = MeshBuilder.CreatePlane("videoStreamButton", {}, scene);
    videoStreamButton.position = new Vector3(-1, 2, 0);
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(videoStreamButton);
    const videoStreamControl = Button.CreateSimpleButton("StartVideoStream", "📡 Start Streaming");
    videoStreamControl.width = 0.6;
    videoStreamControl.height = 0.3;
    videoStreamControl.color = "yellow";
    videoStreamControl.background = "red";
    videoStreamControl.onPointerUpObservable.add(() => {
        console.log("Lets Stream");
        setStartVideoStream(true);
    });
    advancedTexture.addControl(videoStreamControl);

}

export const createVideoStreamDisplay = (scene: Scene) => {
    const videoStreamDisplay = MeshBuilder.CreatePlane("videoStreamDisplay", {
        width: 2,
        height: 2
    }, scene);
    videoStreamDisplay.position = new Vector3(3, 4, 0);
    videoStreamDisplay.rotation.z = Math.PI;

    const videoStreamMaterial = new StandardMaterial("streamingMaterial", scene);
    videoStreamMaterial.diffuseColor = Color3.Black();

    VideoTexture.CreateFromWebCam(scene, (video: VideoTexture) => {

        videoStreamMaterial.emissiveTexture = video;
        videoStreamDisplay.material = videoStreamMaterial;
        
       
    }, {minWidth: 2, minHeight: 2, maxWidth: 256, maxHeight: 256, deviceId: "videoStream"})

    setupLivepeerStream();
}

export const addConnectWalletButton = (
    scene: Scene,
    connectorOptions: {
      isConnected: boolean,
      address?: string,
      connect: any,
      connectors: Array<any>,
      error: any,
      isLoading: boolean,
      pendingConnector: any,
      disconnect: any
    }
  ) => {
    const plane = MeshBuilder.CreatePlane("plane", {}, scene);
    plane.position.y = 2;
    plane.position.x = 1;
  
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);
  
    let button: Button;
    if (connectorOptions.isConnected) {
      button = Button.CreateSimpleButton("disconnet", "❌ disconnet wallet");
      button.background = "green";
    } else {
      button = Button.CreateSimpleButton("newPost", "🔗 connect wallet");
      button.background = "black";
    }
    button.onPointerUpObservable.add(() => {
      console.log("click");
      if (connectorOptions.isConnected) {
          console.log("disconnecting");
          connectorOptions.disconnect();
      } else {
          console.log("connecting");
          connectorOptions.connect({ connector: connectorOptions.connectors[0]})
      }
    });
    button.width = 0.2;
    button.height = 0.1;
    button.color = "white";
  
    advancedTexture.addControl(button);
  }

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
  const plane = MeshBuilder.CreatePlane("plane", {}, scene);
  plane.position.y = 2;
  plane.position.x = 0.5;

  const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

  const button = Button.CreateSimpleButton("newPost", "🔐 Login");
  button.width = 0.2;
  button.height = 0.1;
  button.color = "white";
  button.background = "red";
  button.onPointerUpObservable.add(() => login(connectorOptions.address, connectorOptions.signer, setAccessToken));

  advancedTexture.addControl(button);
}
  