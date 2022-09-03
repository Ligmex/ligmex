import React, { useEffect, useState } from "react";
import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { SceneComponent } from "./Scene";
import { explorePublications, getPost } from "./utils";
import { addPost } from "./things/post";

const App = () => {
  const [post, setPost] = useState("");

  useEffect(() => {
    (async () => {
      setPost(await getPost());
      explorePublications({
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        limit: 10
      });
    })();
  }, []);

  const onSceneReady = (newScene: Scene) => {
    const camera = new ArcRotateCamera(
      "camera1", // name
      0, // Math.PI, // alpha
      0, // Math.PI / 2.0, // beta
      2, // radius
      new Vector3(10, 10, -1), // target
      newScene // scene
    );

    camera.setTarget(Vector3.Zero());

    addPost(newScene, 0, 0, 1, "newpost", "https://i.imgur.com/Pox1X97.png", post);

    try {
      if ((navigator as any).xr) {
        newScene.createDefaultXRExperienceAsync().then(
          (xrexp) => {
            if (xrexp.baseExperience) {
              xrexp.teleportation.attach();
              newScene.onDataLoadedObservable.addOnce(
                (newerScene: Scene) => {
                  const ground = newerScene.getMeshByName("ground");
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
