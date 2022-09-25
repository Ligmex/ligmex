import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import {
    AssetContainer,
    Color3,
    DynamicTexture,
    Mesh,
    MeshBuilder,
    Scene,
    SceneLoader,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";

export type SceneState = {
    newFileToLoad?: string;
    videoStream?: boolean;
    profileToLoad?: string;
    camera: {
        position: Vector3;
        rotation: Vector3;
    };
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
    const textPlane = MeshBuilder.CreatePlane(
        `${id}-handlePlane`,
        { height: size / 4, width: size },
        scene
    );
    const textPlaneTexture = new DynamicTexture(
        `${id}-handleTexture`,
        { width: 512, height: 300 },
        scene,
        true
    );
    textPlaneTexture.drawText(handle, null, null, "bold 50px Arial", "white", "#33334c")
    const textPlaneMaterial = new StandardMaterial(
        `${id}-handleMaterial`,
        scene
    );
    textPlaneMaterial.diffuseTexture = textPlaneTexture;
    textPlaneMaterial.emissiveColor = Color3.White();
    textPlane.material = textPlaneMaterial;
    textPlane.position = position;

    return textPlane;
};