import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export const omit = (object: { [key: string]: any }, name: string) => {
  delete object[name];
  return object;
};

export type AccessToken = {
   accessToken: string;
   refreshToken: string;
}

export type AuthenticateResponse = {
  data: {
   authenticate: AccessToken;
  }
}

export type SceneState = {
  newFileToLoad: string;
  videoStream: boolean;
  camera: {
    position: Vector3;
    rotation: Vector3;
  };
};

type Url = string;
export interface PublicationMetadataMedia {
  item: Url;
  /**
   * This is the mime type of media
   */
  type?: MimeType | null;
  
  /**
   * The alt tags for accessibility
   */
  altTag?: string | null;

  /**
   * The cover for any video or audio you attached
   */
  cover?: string | null;
}

export enum PublicationMainFocus {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  ARTICLE = 'ARTICLE',
  TEXT_ONLY = 'TEXT_ONLY',
  AUDIO = 'AUDIO',
  LINK = 'LINK',
  EMBED = 'EMBED',
}