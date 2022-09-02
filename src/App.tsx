import React, { useRef, useEffect } from "react";

import "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core";

import { SceneComponent } from "./components/SceneComponent";


import "./App.css";

const App: React.FC = () => {
  const onSceneReady = (scene: Scene) => {

    try {
      if ((navigator as any).xr) {
        console.log(scene);
        /*
        scene.createDefaultXRExperienceAsync().then(
          (xrexp) => {
            if (xrexp.baseExperience) {
              xrexp.teleportation.attach();
              scene.onDataLoadedObservable.addOnce(
                (scene: Scene) => {
                  const ground = scene.getMeshByName("ground");
                    xrexp.teleportation.addFloorMesh(ground!);
                });
            }
        });
      */

      }
    } catch(e) {
      console.log(e);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <SceneComponent
          adaptToDeviceRatio
          antialias
          onSceneReady={onSceneReady}
          id="root-canvas"
          style={{ width: "100%", height: "100%" }}
        />
      </header>
    </div>
  );
}

export default App;
