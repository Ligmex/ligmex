import { useEffect, useRef } from "react";

import "@babylonjs/core/Materials/standardMaterial";
import { Engine } from "@babylonjs/core/Engines/engine";
import { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { verifyMessage } from 'ethers/lib/utils'
import { AuthenticateResponse } from "../utils";

import { addConnectWalletButton } from "../things/connectWallet";
import { authenticate } from "../apollo";
import { addLoginButton, addNewPostButton } from "../things/newPost";

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
  const recoveredAddress = useRef<string>()
  const {
    antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onSceneReady, onRender, id, ...rest
  } = props;

  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { error: signerError, isLoading: isLoadingSignMessage, signMessage } = useSignMessage({
    async onSuccess(sig: any, variables: any) {
      if (address && sig) {
        const jwtTokens = (await authenticate(address, sig) as AuthenticateResponse).data.authenticate;
        console.log(jwtTokens);
        localStorage.setItem('ACCESS_TOKEN', jwtTokens.accessToken);
        localStorage.setItem('REFRESH_TOKEN', jwtTokens.refreshToken);
      }
      //const address = verifyMessage(variables.message, sig)
      //console.log(address);
      recoveredAddress.current = address
    },
  });

  useEffect( () => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);
    const camera = new ArcRotateCamera(
      "camera1",
      (Math.PI / 2),
      Math.PI / 2,
      0,
      new Vector3(0, 5, -10),
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

    addConnectWalletButton(scene, {
      isConnected,
      address: address || "",
      connect,
      connectors,
      error,
      isLoading,
      pendingConnector
    });

    if (isConnected && address) {
      addLoginButton(scene, {
        address,
        signMessage,
        signerError,
        isLoadingSignMessage
      });
      addNewPostButton(scene, {
        address,
        signMessage,
        signerError,
        isLoadingSignMessage
      });
    }

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
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  return <canvas ref={reactCanvas} id={id} {...rest} />;
}
