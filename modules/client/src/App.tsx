import React, { useEffect, useState } from "react";

// Components
import { Home } from "./components/Home";
import { Providers } from "./components/Providers";

import './ipfs'

const App = () => {
  
  const [latestPosts, setLatestPosts] = useState([] as any);
  // const [gallery, setGallery] = useState({} as any);

  useEffect(() => {
    (async () => {
      // const latestPosts = await getPosts()
      // console.log(`Got latestPosts: ${JSON.stringify(latestPosts, null, 2)}`);
      // setLatestPosts(latestPosts);

    })();
  }, []);

  return (
    <div style={{height:"100vh", width:"100%"}}>
    <Providers>
      <Home />
    </Providers>
    </div>
  );
};

export default App;
