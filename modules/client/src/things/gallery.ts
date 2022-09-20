import {
  Mesh,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

export const galleryMaker = (scene: Scene, position: Vector3, height: number) => {

  const path = [
    new Vector3(position.x + height, 0, 0),
    new Vector3(position.x - height, 0, 0),
    new Vector3(position.x + height, height, 0),
    new Vector3(position.x - height, height, 0),
  ];

  const profile = [
		new Vector3(-15, 15, 0),
		new Vector3(-15, -15, 0),
		new Vector3(15, -15, 0),
		new Vector3(15, 10, 0),
		new Vector3(10, 10, 0),
		new Vector3(10, 15, 0)
  ];

  let originX = Number.MAX_VALUE;

  for(let m = 0; m < profile.length; m++) {
    originX = Math.min(originX, profile[m].x);
  }

  let angle = 0;
  let width = 0;
  let cornerProfile = [] as any;

  let nbPoints = path.length;
  let line = Vector3.Zero();
  let nextLine = Vector3.Zero();
  path[1].subtractToRef(path[0], line);
  path[2].subtractToRef(path[1], nextLine);

  for(let p = 0; p < nbPoints; p++) {
    angle = Math.PI - Math.acos(Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));
    let direction = Vector3.Cross(line, nextLine).normalize().z;
    let lineNormal = new Vector3(line.y, -1 * line.x, 0).normalize();
    line.normalize();
    let extrusionLength = line.length();
    cornerProfile[(p + 1) % nbPoints] = [] as any;
    //local profile
    for(let m = 0; m < profile.length; m++) {
      width = profile[m].x - originX;
      cornerProfile[(p + 1) % nbPoints].push(path[(p + 1) % nbPoints].subtract(lineNormal.scale(width)).subtract(line.scale(direction * width/Math.tan(angle/2))));
    }
    line = nextLine.clone();
    path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);
  }

  let frame = [] as any[];
  let extrusionPaths = [] as any[]

  for(let p = 0; p < nbPoints; p++) {
    extrusionPaths = [] as any[];
    for(let m = 0; m < profile.length; m++) {
      extrusionPaths[m] = [] as any[];
      extrusionPaths[m].push(new Vector3(cornerProfile[p][m].x, cornerProfile[p][m].y, profile[m].y));
      extrusionPaths[m].push(new Vector3(cornerProfile[(p + 1) % nbPoints][m].x, cornerProfile[(p + 1) % nbPoints][m].y, profile[m].y));
    }
    frame[p] = MeshBuilder.CreateRibbon("frameLeft", {pathArray: extrusionPaths, sideOrientation: Mesh.DOUBLESIDE, updatable: true, closeArray: true}, scene);
  }

  return Mesh.MergeMeshes(frame, true)?.convertToFlatShadedMesh();
}

