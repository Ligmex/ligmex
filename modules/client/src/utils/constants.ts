import { Vector3 } from "@babylonjs/core";

const PROFILE_STEP = 25 / 3;

export const CTRL_PANEL_VIEW_POSITION = new Vector3(10, 2, 4);
export const PROFILE_FRAME_VIEW_POSITION = new Vector3(-8, 2, -6);
export const PROFILE_FRAME_VIEW_ROTATION = new Vector3(0, 0, 0);
export const TRENDING_CORNER_POSITION = new Vector3(10, 0, -10);
export const TRENDING_VIEW_POSITION = new Vector3(0, 2, -13);
export const TRENDING_VIEW_ROTATION = new Vector3(0, Math.PI / 3, 0);

export const PROFILE_0_POSITION = new Vector3(PROFILE_STEP * -2, 0, 0);
export const PROFILE_0_ROTATION = new Vector3(0, 1, 0);
export const PROFILE_1_POSITION = new Vector3(PROFILE_STEP * -1, 0, PROFILE_STEP);
export const PROFILE_1_ROTATION = new Vector3(0, 0, 0);
export const PROFILE_2_POSITION = new Vector3(0, 0, PROFILE_STEP * 2);
export const PROFILE_2_ROTATION = new Vector3(0, 0, 0);
export const PROFILE_3_POSITION = new Vector3(PROFILE_STEP * 1, 0, PROFILE_STEP);
export const PROFILE_3_ROTATION = new Vector3(0, 0, 0);
export const PROFILE_4_POSITION = new Vector3(PROFILE_STEP * 2, 0, 0);
export const PROFILE_4_ROTATION = new Vector3(0, 0, 0);

export const PROFILE_POSITIONS = [
    PROFILE_0_POSITION,
    PROFILE_1_POSITION,
    PROFILE_2_POSITION,
    PROFILE_3_POSITION,
    PROFILE_4_POSITION
];

export const PROFILE_ROTATIONS = [
    PROFILE_0_ROTATION,
    PROFILE_1_ROTATION,
    PROFILE_2_ROTATION,
    PROFILE_3_ROTATION,
    PROFILE_4_ROTATION
];

export const CTRL_BUTTON_HEIGHT = 0.3;
export const CTRL_BUTTON_WIDTH = 0.32;
