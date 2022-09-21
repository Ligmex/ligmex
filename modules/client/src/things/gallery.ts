import {
  // ActionManager,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

import { postMaker } from "./post";

export const galleryMaker = (scene: Scene, position: Vector3, height: number, posts: any[]) => {

  const w = height;
  const h = height / 2;
  const d = height / 16;

  ////////////////////////////////////////
  // Create Frame

  const path = [
    new Vector3(-(w), -(h), 0),
    new Vector3(w, -(h), 0),
    new Vector3(w, h, 0),
    new Vector3(-(w), h, 0),
  ];

  const profile = [
		new Vector3(-(d), d, 0),
		new Vector3(-(d), -(d), 0),
		new Vector3(d, -(d), 0),
		new Vector3(d, d/2, 0),
		new Vector3(d/2, d/2, 0),
		new Vector3(d/2, d, 0)
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

  const finalMesh = Mesh.MergeMeshes(frame, true)?.convertToFlatShadedMesh();
  if (finalMesh) {
    finalMesh.position = new Vector3(position.x, position.y + h, position.z);
  }

  ////////////////////////////////////////
  
  // Add Posts

  const count = posts.length > 6 ? 6 : posts.length;
  const step = ((2 * w) - (2 * d)) / (count + 1);
  const groupWidth = step * (posts.length + 1);

  const groupMesh = MeshBuilder.CreateBox("Post Group", {
    width: groupWidth,
    height: 4 * h,
    depth: 2 * d,
  }, scene);

  const transparentMaterial = new StandardMaterial('boundBoxMaterial', scene);
  transparentMaterial.alpha = 0.5;

  groupMesh.material = transparentMaterial;
  groupMesh.position = new Vector3(position.x + (groupWidth/2) - w + d*2, position.y, position.z);

  posts.forEach(async (post, i) => {
    const postMesh = await postMaker(scene, new Vector3(
      -(groupWidth/2) + step * (i + 1), // position.x - w + d + step * (i + 1),
      0.5, // position.y + 0.5,
      0, // position.z,
    ), post);
    postMesh.forEach(mesh => {
      mesh.parent = groupMesh;
    });
  });

  const pointerDrag = new PointerDragBehavior({
    dragAxis: new Vector3(position.x - w + d, 0, 0)
  })
  pointerDrag.moveAttached = false;
  // pointerDrag.dragDeltaRatio = 1;
  pointerDrag.onDragObservable.add((data, state) => {
    console.log("hi", data.delta);
  });

  groupMesh.addBehavior(pointerDrag);

  /*
  groupMesh.actionManager = new ActionManager(scene);
  groupMesh.actionManager.registerAction(
    SetValueAction(
  */

  return finalMesh;
}

