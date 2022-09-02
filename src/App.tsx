import React, { useEffect, } from "react";
import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { SceneComponent } from "./components/SceneComponent";
import { queryExample } from "./utils";

const App = () => {

  useEffect(() => {
    queryExample();
  }, []);

  const onSceneReady = (scene: Scene) => {
    const camera = new ArcRotateCamera("camera1",Math.PI, Math.PI / 2.0, 20, new Vector3(0, 5, -10), scene);

    camera.setTarget(Vector3.Zero());

    try {
      if ((navigator as any).xr) {
        scene.createDefaultXRExperienceAsync().then(
          (xrexp) => {
            if (xrexp.baseExperience) {
              xrexp.teleportation.attach();
              scene.onDataLoadedObservable.addOnce(
                (scene: Scene) => {
                  const ground = scene.getMeshByName("ground");
                  xrexp.teleportation.addFloorMesh(ground!);
                });
            };
        });

      }
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <div style={{height:"100vh", width:"100%"}}>
      <SceneComponent
        adaptToDeviceRatio
        antialias
        onSceneReady={onSceneReady}
        id="my-canvas"
        style={{ width: "100%", height: "100%" }}
    />
    </div>
  );
};

export default App;
