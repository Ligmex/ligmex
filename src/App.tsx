import React, { useRef, useState } from "react";

import { Camera } from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Nullable } from '@babylonjs/core/types';
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { Scene, Engine } from 'react-babylonjs';

import "./App.css";

const App: React.FC = () => {
  //let sphereRef = useRef(null);
  const sphereRef = useRef<Nullable<Mesh>>(null);

  const [camera, setCamera] = useState<Camera>();

  return (
    <div className="App">
      <header className="App-header">
        <Engine antialias adaptToDeviceRatio canvasId="babylonJs">
          <Scene>
            <arcRotateCamera
              name="camera1"
              target={Vector3.Zero()}
              alpha={Math.PI / 2}
              beta={Math.PI / 4}
              radius={4}
              onCreated={camera => setCamera(camera)}
            />
            <hemisphericLight name='hemi' direction={Vector3.Up()} intensity={0.8} />
            <sphere ref={sphereRef} name="sphere1" diameter={5} segments={16} position={new Vector3(0, 5, 0)}>
              <standardMaterial name='material1' specularPower={16}
                  diffuseColor={Color3.Black()}
                  emissiveColor={new Color3(0.5, 0.5, 0.5)}
              />
            </sphere>
          </Scene>
        </Engine>
      </header>
    </div>
  );
}

export default App;
