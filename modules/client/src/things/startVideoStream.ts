import { Color3, MeshBuilder, Plane, StandardMaterial, Vector3, VideoTexture } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";

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
}