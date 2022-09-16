import React, { useEffect, useState } from "react";

// Components
import { Home } from "./components/Home";
import { Providers } from "./components/Providers";

import './ipfs'

const App = () => {

  return (
    <div style={{height:"100vh", width:"100%"}}>
      <Providers>
        <Home />
      </Providers>
    </div>
  );
};

export default App;
