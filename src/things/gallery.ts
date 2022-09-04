import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { DynamicTexture, Texture } from "@babylonjs/core/Materials/Textures";
import { Scene } from "@babylonjs/core/scene";

export const addGallery = (
  scene: Scene,
  x: number,
  z: number,
  h: number,
  id: string,
  gallery: any,
) => {
  // scene

  const pillar = MeshBuilder.CreateCylinder(
    `${id}-pillar`,
    {diameter: h/4, height: h},
    scene
  );
  pillar.position.x = x;
  pillar.position.y = h/2;
  pillar.position.z = z;

  const plaque = MeshBuilder.CreateBox(
    `${id}-plaque`,
    {bottomBaseAt: h + 2, depth: h/16, height: h/4, width: h/4, },
    scene
  );
  plaque.position.x = x;
  plaque.position.y = h + h/8;
  plaque.position.z = z;
  plaque.addRotation(Math.PI/8, 0, 0);
  plaque.material = new StandardMaterial(`${id}-plaque`, scene);

  const pfp = MeshBuilder.CreateBox(
    `${id}-pfp`,
    {bottomBaseAt: h + 2, depth: h/16, height: h/4, width: h/4, },
    scene
  );
  pfp.position.x = x;
  pfp.position.y = h + h/2;
  pfp.position.z = z;
  pfp.material = new StandardMaterial(`${id}-pillar`, scene);
  const picUrl = `https://lens.infura-ipfs.io/ipfs/${gallery.picture?.original?.url?.replace("ipfs://", "")}`;
  (pfp.material as StandardMaterial).diffuseTexture = new Texture(picUrl);

  const dynamicTexture = new DynamicTexture("DynamicTexture", 50, scene, true);
  dynamicTexture.hasAlpha = true;
  dynamicTexture.drawText(gallery.bio, 5, 40, "bold 8px Arial", "#222222" , "transparent", true);
  (plaque.material as StandardMaterial).diffuseTexture = dynamicTexture;

  /*
  const writing = new DynamicTexture(`${id}-text`, { width: h/6, height: h/8 }, scene, true);
  writing.hasAlpha = true;
  writing.drawText(text, 5, 40, "bold 8px Arial", "#222222" , "transparent", true);
  (plaque.material as StandardMaterial).diffuseTexture = writing;

  const Writer = new BABYLON.MeshWriter(scene);
  const writing = new Writer(text, {
    anchor: "center",
    "letter-height": 500,
    color: "#000000",
    position: {
    },
  });
  writing.position.x = x;
  writing.position.y = h + h/8;
  writing.position.z = z-0.1;
  writing.addRotation(Math.PI/8, 0, 0);
  */

}
