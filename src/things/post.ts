import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures";
import { Scene } from "@babylonjs/core/scene";

export const addPost = (
  scene: Scene,
  x: number,
  y: number,
  h: number,
  id: string,
  url: string,
) => {
  // scene

  const cylinder = MeshBuilder.CreateCylinder(
    id,
    {diameter: 0.5, height: 0.2},
    scene
  );

  cylinder.position.y = y;
  cylinder.position.x = x;
  cylinder.addRotation(0, Math.PI, 0);

  cylinder.material = new StandardMaterial("mat"+id, scene);
  (cylinder.material as StandardMaterial).diffuseTexture = new Texture(url);

}
