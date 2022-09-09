import React, { useEffect, useState } from "react";

// Components
import { Home } from "./components/Home";

import {
  ArcRotateCamera,
  Scene,
  Vector3,
//  SceneLoader,
} from "@babylonjs/core";
// import { GLTFFileLoader } from "@babylonjs/loaders/glTF";

import { explorePublications, getGallery, getPost, getPosts } from "./apollo";
import { addGallery } from "./things/gallery";
// import { addNewPostButton } from "./things/newPost";
import { addPost } from "./things/post";
import { addFrame } from "./things/frame";
import { createTrendingCorner } from "./things/trendingCorner";
import { Providers } from "./components/Providers";
import { useConnect } from 'wagmi'
import './ipfs'

// SceneLoader.RegisterPlugin(new GLTFFileLoader());
const App = () => {
  //const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  //console.log(connect);

  // const [post, setPost] = useState("");
  const [latestPosts, setLatestPosts] = useState([] as any);
  // const [gallery, setGallery] = useState({} as any);

  useEffect(() => {
    (async () => {

      // const post = await getPost()
      // console.log(`Got post: ${JSON.stringify(post, null, 2)}`);
      // setPost(post);

      const latestPosts = await getPosts()
      // console.log(`Got latestPosts: ${JSON.stringify(latestPosts, null, 2)}`);
      // console.log("Latest Posts: ", latestPosts);
      setLatestPosts(latestPosts);

      // const gallery = await getGallery("0x1006"); // "bohendo.eth")
      // console.log(`Got gallery: ${JSON.stringify(gallery, null, 2)}`);
      // setGallery(gallery);

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
    // SceneLoader.LoadAssetContainer( "./", "seagulf.glb", newScene, (container) => {
    //  container.addAllToScene();
    // });
    // addFrame(newScene);
    // addGallery(newScene, 0, 0, 1, "gallery", gallery);

    // createTrendingCorner(newScene);
    /*
    latestPosts.forEach((post: any, i: number) => {
      addPost(newScene, 0 + i, 0 + i, 1, `newpost_${i}`, "https://i.imgur.com/Pox1X97.png", post.metadata.content);
    }); 
    */
  }

  return (
    <div style={{height:"100vh", width:"100%"}}>
    <Providers>
      <Home />
    </Providers>
    </div>
  );
};

export default App;
