import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures";
import { Scene } from "@babylonjs/core/scene";

export const Posts = (props: {
  id: string,
  scene: Scene,
  angle: number,
  url: string,
} & React.CanvasHTMLAttributes<HTMLCanvasElement>) => {

  const { id, scene, angle, url } = props;

  const cylinder = MeshBuilder.CreateCylinder(
    id,
    {diameter: 0.5, height: 0.2},
    scene
  );

  cylinder.position.y = Math.sin(angle);
  cylinder.position.x = Math.cos(angle);
  cylinder.rotation.x = Math.PI/2;
  cylinder.addRotation(0, Math.PI, 0);

  cylinder.material = new StandardMaterial("mat"+id, scene);
  (cylinder.material as StandardMaterial).diffuseTexture = new Texture(url);
}
