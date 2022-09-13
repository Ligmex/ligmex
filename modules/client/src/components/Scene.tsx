import { useEffect, useRef } from "react";

import "@babylonjs/core/Materials/standardMaterial";
import { Engine } from "@babylonjs/core/Engines/engine";
import { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { verifyMessage } from 'ethers/lib/utils'
import { SceneLoader } from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

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

  useEffect( () => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);
    const camera = new ArcRotateCamera(
      "camera1",
      0,
      Math.PI / 3,
      20,
      new Vector3(0, 0, 0),
      scene,
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    light.intensity = 1;

    MeshBuilder.CreateGround(
      "ground",
      { height: 10, width: 10, },
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
      if (typeof(onRender) === "function") onRender(scene);
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
