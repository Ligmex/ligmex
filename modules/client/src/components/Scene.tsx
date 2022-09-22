import { useEffect, useRef } from "react";

import "@babylonjs/core/Materials/standardMaterial";
import { Engine } from "@babylonjs/core/Engines/engine";
import { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { verifyMessage } from 'ethers/lib/utils'
import { DeviceSourceManager, DeviceType, FreeCamera, PointerInput } from "@babylonjs/core";

import { buildFromPlan } from "../utils";

const buildWalls = (scene: Scene) => {
  const baseData = [-25, -25, -25, 25, 25, 25, 25, -25];

  const corners = [] as Vector3[];
  for (let b = 0; b < baseData.length / 2; b++) {
    corners.push(new Vector3(baseData[2 * b],0, baseData[2 * b + 1]));
  }

  const walls = [] as Array<{corner: Vector3 }>;

  for (let c = 0; c < corners.length; c++) {
    walls.push({corner: corners[c]});
  }

  const ply = 0.3;
  const height = 1;

  let newWall = buildFromPlan(walls, ply, height, scene);
}

const setupFPSCameraMovements = (scene: Scene) => {

  const camera = new FreeCamera("fpsCamera", new Vector3(10, 1, 0), scene);
  let dsm = new DeviceSourceManager(scene.getEngine());

  dsm.onDeviceConnectedObservable.add((device) => {
    // KEYBOARD CONFIG
    if (device.deviceType === DeviceType.Keyboard) {
      scene.onBeforeRenderObservable.add(() => {

        // Arrow keys to rotate
        if (device.getInput(37) === 1) {
          camera.rotation.y -= 0.01;
        }
        if (device.getInput(39) === 1) {
          camera.rotation.y += 0.01;
        }
        if (device.getInput(38) === 1) {
          camera.rotation.x -= 0.01;
        }
        if (device.getInput(40) === 1) {
          camera.rotation.x += 0.01;
        }
      });
    }
    // POINTER CONFIG
    else if (device.deviceType === DeviceType.Mouse || device.deviceType === DeviceType.Touch) {
      device.onInputChangedObservable.add((deviceData) => {
        if (deviceData.inputIndex === PointerInput.Move && device.getInput(PointerInput.LeftClick) === 1) {
          camera.rotation.y += deviceData.movementX * 0.00175;
          camera.rotation.x += deviceData.movementY * 0.00175;
        }
      });

      // Move forward if 2 fingers are pressed against screen
      if (!scene.beforeRender && device.deviceType === DeviceType.Touch) {
        scene.beforeRender = () => {
          let transformMatrix = Matrix.Zero();
          let localDirection = Vector3.Zero();
          let transformedDirection = Vector3.Zero();
          let isMoving = false;

          if (dsm.getDeviceSources(DeviceType.Touch).length === 2) {
            localDirection.z = 0.1;
            isMoving = true;
          }

          if (isMoving) {
            camera.getViewMatrix().invertToRef(transformMatrix);
            Vector3.TransformNormalToRef(localDirection, transformMatrix, transformedDirection);
            camera.position.addInPlace(transformedDirection);
          }
        };
      }
    }
  });

} 

export const SceneComponent = (props: {
  antialias: boolean;
  engineOptions?: EngineOptions;
  adaptToDeviceRatio?: boolean;
  sceneOptions?: SceneOptions;
  onRender?: (scene: Scene) => void;
  onSceneReady: (scene: Scene) => void;
  id: string;
} & React.CanvasHTMLAttributes<HTMLCanvasElement>) => {
  const reactCanvas = useRef(null);
  const {
    antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onSceneReady, onRender, id, ...rest
  } = props;

  useEffect(() => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);

    // scene.onPointerDown = (evt) => {
    //   if (evt.button === 0) engine.enterPointerlock();
    //   if (evt.button === 1) engine.exitPointerlock();
    // };
    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
    scene.collisionsEnabled = true;

    setupFPSCameraMovements(scene);
    
    const camera2 = new ArcRotateCamera(
      "camera1",
      -Math.PI/2,
      Math.PI/3,
      25,
      new Vector3(0, 2, 0),
      scene,
    );
    camera2.attachControl(canvas, true);
    camera2.zoomToMouseLocation = true;
    camera2.allowUpsideDown = false;

    buildWalls(scene);
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 1;

   

    MeshBuilder.CreateGround(
      "ground",
      { height: 50, width: 50, },
      scene
    );

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene: Scene) => {
        onSceneReady(scene)
      });
    }

    engine.runRenderLoop(() => {
      if (typeof (onRender) === "function") onRender(scene);
      scene.render(true);
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      console.log("Disposing Scene");
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  return <canvas ref={reactCanvas} id={id} {...rest} />;
}
