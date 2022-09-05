import React, { useEffect, useState } from "react";
import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { SceneComponent } from "./Scene";
import { explorePublications, getGallery, getPost } from "./apollo";
import { addGallery } from "./things/gallery";
import { addPost } from "./things/post";
import { addFrame } from "./things/frame";

const App = () => {
  const [post, setPost] = useState("");
  const [gallery, setGallery] = useState({} as any);

  useEffect(() => {
    (async () => {

      const post = await getPost()
      console.log(`Got post: ${JSON.stringify(post, null, 2)}`);
      setPost(post);

      const gallery = await getGallery("0x1006"); // "bohendo.eth")
      console.log(`Got gallery: ${JSON.stringify(gallery, null, 2)}`);
      setGallery(gallery);

      /*
      explorePublications({
        sortCriteria: "LATEST",
        publicationTypes: ["POST"], // , "COMMENT", "MIRROR"],
        limit: 10
      });
      */

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

    addGallery(newScene, 0, 0, 1, "gallery", gallery);
    addFrame(newScene);

    // addPost(newScene, 0, 0, 1, "newpost", "https://i.imgur.com/Pox1X97.png", post);

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
