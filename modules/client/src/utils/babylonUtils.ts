import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import {
    AssetContainer,
    Color3,
    DynamicTexture,
    FreeCamera,
    Mesh,
    MeshBuilder,
    Scene,
    SceneLoader,
    StandardMaterial,
    Texture,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
// Babylon GUI imports
import { Button } from "@babylonjs/gui/2D/controls/button";
// Web3 imports
import { verifyMessage } from "ethers/lib/utils";
// Livepeer imports
import { Client, isSupported } from "@livepeer/webrtmp-sdk";

import { AuthenticateResponse, SceneState } from './misc';
import { authenticate, generateChallenge } from "./lensApi"
import { CTRL_BUTTON_HEIGHT, CTRL_BUTTON_WIDTH } from "./constants"

const LIVPEER_API_KEY = localStorage.getItem("LIVPEER_API_KEY") || "null";

const setupLivepeerStream = async (videoEl: HTMLVideoElement) => {
    if (!isSupported()) {
        console.log("Browser not supported");
        return;
    }
    try {
        const response = await fetch(`https://livepeer.studio/api/stream`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LIVPEER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "ligmexNewLiveStream",
                "profiles": [
                    {
                        "name": "720p",
                        "bitrate": 2000000,
                        "fps": 30,
                        "width": 1280,
                        "height": 720
                    },
                    {
                        "name": "480p",
                        "bitrate": 1000000,
                        "fps": 30,
                        "width": 854,
                        "height": 480
                    },
                    {
                        "name": "360p",
                        "bitrate": 500000,
                        "fps": 30,
                        "width": 640,
                        "height": 360
                    }
                ]
            })
        });
        const data = await response.json();
        if (data?.streamKey) {
            const stream = videoEl.srcObject;
            const client = new Client();
            const session = client.cast(stream! as MediaStream, data?.streamKey);
            session.on('open', () => {
                console.log('Stream started.')
            })
            session.on('close', () => {
                console.log('Stream stopped.')
            })
            session.on('error', (err) => {
                console.log('Stream error.', err.message)
            })
        }
    } catch (e) {
        console.log(e);
    }
};

const login = async (address: string, signMessage: any, setAccessToken: any) => {
    // request a challenge from the server
    const challengeResponse = await generateChallenge(address);
    // sign the text with the wallet
    const sig = await signMessage({ message: challengeResponse.data.challenge.text });
    console.log(`sig=${sig}`);
    const recoveredAddress = verifyMessage(challengeResponse.data.challenge.text, sig)
    if (address === recoveredAddress && sig) {
        const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
        console.log(`Setting access token to: access=${jwtTokens.accessToken} | refresh=${jwtTokens.refreshToken}`);
        setAccessToken(jwtTokens);
        localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
        localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
    }
};

export const createUploadFileView = (scene: Scene, filname: string | undefined) => {
    if (!scene || !filname) return;
    SceneLoader.LoadAssetContainer("file:", filname, scene, (container) => {
        scaleNewMeshes(container.meshes, new Vector3(0, 4, 0));
        // container.meshes[0].scaling = new Vector3(0.05, 0.05, -0.05);
        container.meshes.forEach((mesh: AbstractMesh) => {
            mesh.checkCollisions = true;
        })
        container.addAllToScene();
    });
};

export const createStartVideoStreamButton = (
    scene: Scene,
    setSceneState: React.Dispatch<React.SetStateAction<SceneState>>
) => {
  const videoStreamButton = Button.CreateSimpleButton("StartVideoStream", "📡 Start Streaming");
  videoStreamButton.width = CTRL_BUTTON_WIDTH;
  videoStreamButton.height = CTRL_BUTTON_HEIGHT;
  videoStreamButton.color = "yellow";
  videoStreamButton.background = "red";
  videoStreamButton.onPointerUpObservable.add(() => {
    const fpsCamera = scene.getCameraByName("fpsCamera") as FreeCamera;
    setSceneState({
      newFileToLoad: "",
      videoStream: true,
      camera: {
        position: fpsCamera?.position,
        rotation: fpsCamera?.rotation
      }
    });
  });
  return videoStreamButton;
};

export const createProfilePicture = (
    scene: Scene,
    id: string,
    url: string,
    size: number,
    position: Vector3,
    rotation: Vector3
) => {
    const profilePicture = MeshBuilder.CreateCylinder(
        `${id}-profileDisc`,
        { diameter: size, height: 0.05 },
        scene
    )
    const material = new StandardMaterial(`${id}-profilePicture`, scene);
    try {
        material.diffuseTexture = new Texture(url, scene);
    } catch (e) {
        console.log(e);
    }
    material.emissiveColor = Color3.White();
    profilePicture.material = material;
    profilePicture.position = position;
    profilePicture.rotation = rotation;
    return profilePicture;
};

export const createVideoStreamDisplay = (scene: Scene) => {
    const videoStreamDisplay = MeshBuilder.CreatePlane("videoStreamDisplay", {
        width: 2,
        height: 2
    }, scene);
    videoStreamDisplay.position = new Vector3(3, 4, 0);
    videoStreamDisplay.rotation.z = Math.PI;
    const videoStreamMaterial = new StandardMaterial("streamingMaterial", scene);
    videoStreamMaterial.diffuseColor = Color3.Black();
    VideoTexture.CreateFromWebCam(scene, (videoTexture: VideoTexture) => {
        videoStreamMaterial.emissiveTexture = videoTexture;
        videoStreamDisplay.material = videoStreamMaterial;
        setupLivepeerStream(videoTexture.video);
    }, { minWidth: 2, minHeight: 2, maxWidth: 256, maxHeight: 256, deviceId: "videoStream" })
};

export const addConnectWalletButton = (
    scene: Scene,
    connectorOptions: {
        address?: string,
        connect: any,
        connectors: Array<any>,
        disconnect: any,
        error: any,
        isConnected: boolean,
        isLoading: boolean,
        pendingConnector: any,
    }
) => {
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
          connectorOptions.connect({ connector: connectorOptions.connectors[0] })
      }
  });
  button.width = CTRL_BUTTON_WIDTH;
  button.height = CTRL_BUTTON_HEIGHT;
  button.color = "white";
  return button;
};

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
    const button = Button.CreateSimpleButton("newPost", "🔐 Login");
    button.width = CTRL_BUTTON_WIDTH;
    button.height = CTRL_BUTTON_HEIGHT;
    button.color = "white";
    button.background = "red";
    button.onPointerUpObservable.add(() => login(connectorOptions.address, connectorOptions.signer, setAccessToken));
    return button;
};

export const scaleAndCenterMeshes = (id: string, scene: Scene, assetContainer: AssetContainer): Mesh | undefined => {
    if (assetContainer.meshes[0] === undefined) return undefined;
    let minimum;
    let maximum;
    let center;
    // Create Transparent Material
    const transparentMaterial = new StandardMaterial('boundBoxMaterial', scene);
    transparentMaterial.alpha = 0.2;
    // Create Bounding Box Mesh
    const boundBox = MeshBuilder.CreateBox(`${id}-boundCube`, {}, scene);
    boundBox.material = transparentMaterial;
    boundBox.scaling = new Vector3(0.5, 0.5, -0.5);
    // Create Scaling Box Mesh
    const scaleBox = MeshBuilder.CreateBox(`${id}-scaleCube`, {}, scene);
    scaleBox.material = transparentMaterial;
    scaleBox.parent = boundBox
    for (let i = 1; i < assetContainer.meshes.length; i++) {
        assetContainer.meshes[i].parent = scaleBox;
    }
    // Get group maximum bounds
    assetContainer.meshes.forEach((mesh) => {
        if (mesh.material !== undefined && mesh.subMeshes !== undefined) {
            let boundingInfo = mesh.getHierarchyBoundingVectors();
            if (minimum === undefined) {
                minimum = boundingInfo.min;
                maximum = boundingInfo.max;
            } else {
                maximum.maximizeInPlace(boundingInfo.max);
                minimum.minimizeInPlace(boundingInfo.min);
            }
        }
    })
    // Get center of the group of meshes
    if (minimum) {
        let sum = maximum.add(minimum);
        center = sum.divide(new Vector3(-1, -1, 1));
    }
    assetContainer.meshes.forEach((mesh) => {
        mesh.position.addInPlace(center);
    })
    let localMax = 0;
    for (let key in { x: 0, y: 0, z: 0 }) {
        let scale = Math.abs(maximum[key] - minimum[key]);
        if (scale > localMax)
            localMax = scale;
    }
    scaleBox.scaling = new Vector3(1 / localMax, 1 / localMax, 1 / localMax);
    return boundBox;
};

export const scaleNewMeshes = (newMeshes: AbstractMesh[], position = Vector3.Zero()): AbstractMesh | undefined => {
    if (newMeshes[0] === undefined) return;
    const scaleBox = newMeshes[0];
    let newMin;
    let newMax;
    for (let i = 1; i < newMeshes.length; i++) {
        let boundingInfo = newMeshes[i].getBoundingInfo();
        if (!newMin) {
            newMin = boundingInfo.boundingBox.minimumWorld;
            newMax = boundingInfo.boundingBox.maximumWorld;
        } else {
            newMin = Vector3.Minimize(boundingInfo.boundingBox.minimumWorld, newMin);
            newMax = Vector3.Maximize(boundingInfo.boundingBox.maximumWorld, newMax);
        }
    }
    let localMax = 0;
    for (let key in { x: 0, y: 0, z: 0 }) {
        let scale = Math.abs(newMax[key] - newMin[key]);
        if (scale > localMax)
            localMax = scale;
    }
    scaleBox.scaling = new Vector3(1 / localMax, 1 / localMax, -1 / localMax);
    scaleBox.position = position;
    scaleBox.rotation = new Vector3(0, 0, 0)
    return scaleBox;
};

export const createTextDisplay = (
    scene: Scene,
    size: number,
    id: string,
    handle: string,
    position: Vector3,
) => {
    const profileHandlePlane = MeshBuilder.CreatePlane(
        `${id}-handlePlane`,
        { height: size / 4, width: size },
        scene
      );
      const profileHandleTextue = new DynamicTexture(
        `${id}-handleTexture`,
        { width: 512, height: 300 },
        scene,
        true
      );
      profileHandleTextue.drawText(handle, null, null, "bold 50px Arial", "white", "#33334c")
      const profileHandleMaterial = new StandardMaterial(
        `${id}-handleMaterial`,
        scene
      );
      profileHandleMaterial.diffuseTexture = profileHandleTextue;
      profileHandleMaterial.emissiveColor = Color3.White();
      profileHandlePlane.material = profileHandleMaterial;
      profileHandlePlane.position = position;
    
};
