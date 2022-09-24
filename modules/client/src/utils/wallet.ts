import {
    Scene,
} from "@babylonjs/core";
// Babylon GUI imports
import { Button } from "@babylonjs/gui/2D/controls/button";

import { CTRL_BUTTON_HEIGHT, CTRL_BUTTON_WIDTH } from "./constants"

export const addConnectWalletButton = (
    scene: Scene,
    connectorOptions: {
        address?: string,
        connect: any,
        connectors: Array<any>,
        disconnect: any,
        error: any,
        isConnected: boolean,
        isLoading: boolean,
        pendingConnector: any,
    }
) => {
  let button: Button;
  if (connectorOptions.isConnected) {
      button = Button.CreateSimpleButton("disconnet", "❌ disconnet wallet");
      button.background = "green";
  } else {
      button = Button.CreateSimpleButton("newPost", "🔗 connect wallet");
      button.background = "black";
  }
  button.onPointerUpObservable.add(() => {
      console.log("click");
      if (connectorOptions.isConnected) {
          console.log("disconnecting");
          connectorOptions.disconnect();
      } else {
          console.log("connecting");
          connectorOptions.connect({ connector: connectorOptions.connectors[0] })
      }
  });
  button.width = CTRL_BUTTON_WIDTH;
  button.height = CTRL_BUTTON_HEIGHT;
  button.color = "white";
  return button;
};
