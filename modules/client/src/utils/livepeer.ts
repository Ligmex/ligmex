import {
    Color3,
    FreeCamera,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
// Babylon GUI imports
import { Button } from "@babylonjs/gui/2D/controls/button";
// Livepeer imports
import { Client, isSupported } from "@livepeer/webrtmp-sdk";

import { SceneState } from './babylonUtils';
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
